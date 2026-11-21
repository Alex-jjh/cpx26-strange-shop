"""Validate the offline handoff package without network access."""
import csv
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path
import struct
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent


def read_json(name):
    return json.loads((ROOT / name).read_text())


def rows(name):
    with (ROOT / 'data' / name).open(encoding='utf-8-sig', newline='') as handle:
        return list(csv.DictReader(handle))


def dimensions(data):
    if data.startswith(b'\x89PNG\r\n\x1a\n'):
        return struct.unpack('>II', data[16:24])
    if data[:4] == b'RIFF' and data[8:12] == b'WEBP':
        offset = 12
        while offset + 8 <= len(data):
            kind = data[offset:offset + 4]
            length = int.from_bytes(data[offset + 4:offset + 8], 'little')
            payload = data[offset + 8:offset + 8 + length]
            if kind == b'VP8 ':
                assert payload[3:6] == b'\x9d\x01\x2a'
                return (int.from_bytes(payload[6:8], 'little') & 0x3fff,
                        int.from_bytes(payload[8:10], 'little') & 0x3fff)
            if kind == b'VP8L':
                assert payload[0] == 0x2f
                bits = int.from_bytes(payload[1:5], 'little')
                return (bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1
            if kind == b'VP8X':
                return int.from_bytes(payload[4:7], 'little') + 1, int.from_bytes(payload[7:10], 'little') + 1
            offset += 8 + length + length % 2
        raise AssertionError('WebP dimensions not found')
    assert data[:2] == b'\xff\xd8', 'Unsupported image content'
    position = 2
    while position < len(data):
        assert data[position] == 0xFF, 'Invalid JPEG marker'
        while data[position] == 0xFF:
            position += 1
        marker = data[position]
        position += 1
        if marker in (0xD8, 0xD9) or 0xD0 <= marker <= 0xD7:
            continue
        size = struct.unpack('>H', data[position:position + 2])[0]
        if marker in (0xC0, 0xC1, 0xC2):
            height, width = struct.unpack('>HH', data[position + 3:position + 7])
            return width, height
        position += size
    raise AssertionError('JPEG dimensions not found')


class LocalLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = []
        self.cards = 0

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == 'article':
            self.cards += 1
        for key in ('src', 'href'):
            value = attributes.get(key, '')
            if value and not urlparse(value).scheme and not value.startswith('#'):
                self.paths.append(value)


def main():
    package = read_json('data/products.researched.json')
    products = package['products']
    ids = {p['id'] for p in products}
    expected = {p['id'] for p in json.loads((ROOT.parent / 'src/data/products.json').read_text())}
    assert len(products) == len(ids) == 25 and ids == expected
    runtime = {p['id']: p for p in read_json('data/products.runtime.json')}
    assert list(runtime.values()) == json.loads((ROOT.parent / 'src/data/products.json').read_text())
    terms = read_json('data/product-details.json')
    assert terms == json.loads((ROOT.parent / 'src/data/product-details.json').read_text())
    sources = {s['id']: s for s in read_json('sources/sources.json')}
    for source in sources.values():
        assert source['url'].startswith(('https://', 'http://'))
        assert source['capturedAt'] == package['capturedAt']
        assert source['facts']
    images = read_json('sources/images.json')
    for image in images:
        path = ROOT / image['file']
        data = path.read_bytes()
        assert len(data) == image['bytes']
        assert hashlib.sha256(data).hexdigest() == image['sha256']
        assert dimensions(data) == (image['width'], image['height'])
        assert min(dimensions(data)) >= 240
        if image['origin'] == 'ai-generated-illustration':
            assert image['disclosure'] and (ROOT / image['generationRecord']).is_file()
        else:
            assert image['url'].startswith(('https://', 'http://'))
            assert image['edited'] is False
        extension = '.png' if data.startswith(b'\x89PNG') else '.jpg' if data.startswith(b'\xff\xd8') else '.webp'
        assert path.suffix == extension, f'Wrong extension: {path}'
    assert len(images) == 27
    image_paths = {i['file'] for i in images}
    product_rows = {row['ID']: row for row in rows('products.csv')}
    rental_rows = {row['商品ID']: row for row in rows('rentals.csv')}
    assert set(product_rows) == set(rental_rows) == ids
    accessories = rows('accessories.csv')
    assert len(accessories) == sum(len(p['accessories']) for p in products)
    for product in products:
        assert product['price']['amount'] > 0
        assert product['price']['sourceId'] in sources
        assert product['source']['url'] == sources[product['price']['sourceId']]['url']
        assert product['image'] in image_paths
        assert float(product_rows[product['id']]['报价_CNY']) == product['price']['amount']
        assert product_rows[product['id']]['本地图片'] == product['image']
        assert product['readyForDirectImport'] is True
        assert product['editorialUsageIsMeasured'] is False
        freight = product['shipping']
        assert freight['amount'] is not None and freight['amount'] >= 0
        assert freight['status'].startswith('conditional-') and freight['sourceId'] in sources
        delivery_conditions = terms[product['id']]['shippingCondition']
        assert freight['condition'] in delivery_conditions
        assert product_rows[product['id']]['运费适用条件'] == delivery_conditions
        for accessory in product['accessories']:
            if accessory['necessity'] != 'included' and accessory.get('shipping', {}).get('condition'):
                assert accessory['shipping']['condition'] in delivery_conditions
        assert float(product_rows[product['id']]['运费_CNY']) == freight['amount']
        cost = product['price']['amount'] + freight['amount'] + sum(
            a['quote']['amount'] for a in product['accessories'] if a['necessity'] in ('conditional', 'consumable'))
        assert float(product_rows[product['id']]['本场景总价_CNY']) == round(cost, 2)
        rental = product['rental']
        if rental.get('pricePerDay') is not None:
            assert rental['pricePerDay'] > 0 and rental['minimumDays'] > 0
            assert rental['sourceId'] in sources
            assert float(rental_rows[product['id']]['挂牌日租_CNY']) == rental['pricePerDay']
        else:
            assert rental_rows[product['id']]['挂牌日租_CNY'] == ''
            assert 'rent' not in runtime[product['id']]['alternatives']
        if rental.get('kind') == 'onsite-practice-room':
            assert rental['pricePerHour'] == 50 and rental.get('pricePerDay') is None
        if rental.get('packagePrice') is not None:
            assert rental['packagePrice'] == 50 and rental['packageDaysIncluded'] == 7
        actual = [r for r in accessories if r['商品ID'] == product['id']]
        assert len(actual) == len(product['accessories'])
        for accessory, row in zip(product['accessories'], actual):
            assert accessory['name'] == row['配件或耗材']
            price = accessory['quote']
            if price['amount'] is not None:
                assert price['amount'] >= 0 and price['sourceId'] in sources
                assert price['amount'] != 0 or accessory['necessity'] == 'included'
                assert float(row['报价_CNY']) == price['amount']
            else:
                assert accessory['necessity'] == 'included' and row['报价_CNY'] == '不另购'
        for relative in runtime[product['id']]['images'].values():
            target = ROOT.parent / 'public' / relative.lstrip('/')
            source = ROOT / 'images' / Path(relative).name
            assert target.read_bytes() == source.read_bytes()
    parser = LocalLinks()
    parser.feed((ROOT / 'index.html').read_text())
    assert parser.cards == 25
    assert all((ROOT / path).is_file() for path in parser.paths)
    print(f'PASS: {len(products)} products, {len(accessories)} accessory records, '
          f'{len(sources)} sources, {len(images)} images; CSV/JSON/preview consistent.')
    print('Runtime copies match. Published quote conditions remain applicable; no checkout was performed.')


if __name__ == '__main__':
    main()
