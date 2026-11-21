"""Build the source-backed handoff and offline app catalog from research inputs."""
import copy
import csv
import hashlib
import html
import json
from pathlib import Path
import shutil
import sys
sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
sys.path.insert(0, str(ROOT))
from validate import dimensions

DATE = '2026-11-21'
LABELS = {
    'official-listed': '官网页面价',
    'official-listed-out-of-stock': '官网标价（缺货）',
    'official-search-listed': '官网搜索报价',
    'merchant-listed': '商家页面价',
    'aggregator-listed': '商家报价聚合',
    'aggregator-active-promotion': '有期限活动报价',
}


def load(path):
    return json.loads((ROOT / path).read_text())


def save(path, value):
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def csv_save(path, headers, rows):
    with (ROOT / 'data' / path).open('w', encoding='utf-8-sig', newline='') as handle:
        writer = csv.writer(handle)
        writer.writerow(headers)
        writer.writerows(rows)


def image_record(ident, file, url=None, source_page=None, origin='downloaded-original'):
    data = (ROOT / file).read_bytes()
    width, height = dimensions(data)
    return dict(id=ident, file=file, url=url, sourcePage=source_page,
                capturedAt=DATE, width=width, height=height, bytes=len(data),
                sha256=hashlib.sha256(data).hexdigest(), origin=origin,
                license='not-specified-by-source' if origin == 'downloaded-original' else 'generated-illustration',
                edited=origin != 'downloaded-original')


def actual_extension(data):
    if data.startswith(b'\x89PNG'):
        return '.png'
    if data.startswith(b'\xff\xd8'):
        return '.jpg'
    if data[:4] == b'RIFF' and data[8:12] == b'WEBP':
        return '.webp'
    raise ValueError('Unsupported downloaded image')


def rental_summary(offer):
    if not offer or not offer.get('kind'):
        return '未选用已核验的租赁报价，可考虑借用或已有设备；不代表市场上不存在租赁。'
    lead = ('同型号' if offer['modelMatch'] else '替代方案') + '：' + offer['model'] + '。'
    if offer['kind'] == 'onsite-practice-room':
        return lead + f"到店练习¥{offer['pricePerHour']:g}/小时，不是设备外借；{offer['serviceArea']}。"
    if offer.get('packagePrice') is not None:
        return lead + f"¥{offer['packagePrice']:g}包含{offer['packageDaysIncluded']}天以内，超期¥{offer['extraDayPrice']:g}/天；押金¥{offer['deposit']:g}；{offer['shipping']['condition']}"
    return lead + f"展示¥{offer['pricePerDay']:g}/天，{offer['minimumDays']}天起；{offer['priceCondition']} 押金¥{offer['deposit']:g}。{offer['depositCondition']} {offer['serviceArea']}；{offer['shipping']['condition']}"


def shipping_conditions(item):
    conditions = [item['shipping']['condition']]
    for accessory in item['accessories']:
        condition = accessory.get('shipping', {}).get('condition')
        if accessory['necessity'] != 'included' and condition:
            conditions.append(accessory['name'] + '：' + condition)
    return '；'.join(conditions)


def main():
    archive = ROOT / 'archive' / 'v1'
    if not archive.exists():
        for relative in ('data', 'sources'):
            shutil.copytree(ROOT / relative, archive / relative)
        for name in ('README.md', 'TODO.md', 'VERIFICATION.md', 'index.html'):
            shutil.copyfile(ROOT / name, archive / name)
        for record in load('sources/images.json'):
            target = archive / record['file']
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / record['file'], target)

    base = load('archive/v1/data/products.researched.json')
    items = base['products']
    by_id = {p['id']: p for p in items}
    sources = {s['id']: s for s in load('archive/v1/sources/sources.json')}
    images = {r['id']: r for r in load('archive/v1/sources/images.json')}
    updates = load('research/quotes-updated.json')
    assert not updates['remainingUnresolved'], 'Required purchase quotes remain unresolved'
    sources.update({s['id']: s for s in updates['sources']})
    for patch in updates['products']:
        by_id[patch['id']].update(copy.deepcopy(patch))
        if patch.get('image', '').startswith('research/'):
            source_path = ROOT / patch['image']
            relative = 'images/' + patch['id'] + actual_extension(source_path.read_bytes())
            shutil.copyfile(source_path, ROOT / relative)
            by_id[patch['id']]['image'] = relative
            evidence = sources[by_id[patch['id']]['price']['sourceId']]
            images[patch['id']] = image_record(patch['id'], relative, evidence['imageUrl'], evidence['url'])

    # Select concrete basic-use bundles instead of retaining unpriced optional items.
    projector = by_id['projector']
    projector['accessories'] = [projector['accessories'][0]]
    projector['accessories'][0]['requiredWhen'] = '本演示使用有线HDMI输入，且没有现成线材；与机器同单满足免邮门槛。'
    projector['notes'] = ['官网默认北京地址缺货，记录为缺货标价；本应用仅模拟审批。', '积灰图为AI生成情境示意，不是真实使用记录。']
    projector['dustyImage'] = 'images/projector-dusty.png'
    projector['purchaseScenario'] = '已有稳固桌面、白墙及HDMI播放设备，本次按有线连接且没有现成HDMI线核算。'
    for ident in ('massage-gun', 'air-fryer'):
        by_id[ident]['excludedAccessories'] = [dict(name=a['name'], reason='可选项不在本次基础采购包内，不沿用未核实价格。') for a in by_id[ident]['accessories']]
        by_id[ident]['accessories'] = []
    scenarios = {
        'massage-gun': '采用标准整机及随附按摩头，不另外采购替换头。',
        'air-fryer': '采用整机基础烹饪场景，已有食材；烘焙纸不属于必需硬件。',
        'coffee-machine': '没有现成咖啡豆，首包250g豆另购；整机内置研磨，不另买磨豆机。',
        'instant-camera': '按机身无相纸、尚未持有mini相纸核算，另购20张相纸加相册组合。',
        'e-drum': '按官方基础鼓组且没有适用鼓凳、耳机、鼓棒核算；商家赠品不默认已包含。',
        'fitness-ring': '按没有兼容Switch主机及Joy-Con核算；已有主机的用户可不新增主机采购。',
        'blender': '采用整机基础使用场景，已有食材和电源插座。',
    }
    for ident, scenario in scenarios.items():
        by_id[ident]['purchaseScenario'] = scenario

    expansion = load('research/new-products.json')
    images.update({r['id']: r for r in load('research/new-images.json')})
    for record in images.values():
        path = ROOT / record['file']
        correct = path.with_suffix(actual_extension(path.read_bytes()))
        if correct != path:
            shutil.copyfile(path, correct)
            record['file'] = str(correct.relative_to(ROOT))
    for entry in expansion['products']:
        ident = entry['id']
        sid = 'mi-' + ident
        url = 'https://www.mi.com/shop/buy?product_id=' + entry['sku']
        sources[sid] = dict(id=sid, title='小米商城：' + entry['name'], url=url,
                            capturedAt=DATE, method='live-browser-official-search',
                            facts=f"当前选定规格搜索报价{entry['price']}元；未叠加领券或划线价。库存及具体配送地区按订单确认。")
        item = dict(id=ident, name=entry['name'], category=entry['category'], family=entry['family'],
                    price=dict(amount=entry['price'], currency='CNY', kind='official-search-listed',
                               sourceId=sid, url=url, capturedAt=DATE, note='官网实时搜索卡片报价，未承诺目标地址有货。'),
                    stock='官网搜索列示，目标地址库存未预订',
                    shipping=dict(amount=0, currency='CNY', status='conditional-policy', sourceId='mi-shipping',
                                  condition=expansion['shipping']['condition']),
                    accessories=[], image=images[ident]['file'], source=dict(url=url, capturedAt=DATE),
                    editorialUsage=entry['usage'], editorialUsageIsMeasured=False,
                    purchaseScenario='基础整机采购，已有适用电源及日常耗材，不另购可选配件。',
                    notes=['与原有品类相近的新增候选，不是仅换颜色的重复记录。'])
        if entry['family'] == 'projector':
            item['purchaseScenario'] = '已有稳固桌面、适用墙面及可兼容无线投屏的设备，不另购支架、幕布或HDMI线。'
        if ident == 'portable-coffee':
            item['purchaseScenario'] = '已有与机器相适配的咖啡耗材；此条只核算整机，不假定任意胶囊均兼容。'
        items.append(item)
        by_id[ident] = item

    capsule = expansion['accessories'][0]
    capsule_sid = 'mi-cafe-royal-30'
    sources[capsule_sid] = dict(id=capsule_sid, title=capsule['name'], url=capsule['source'], capturedAt=DATE,
                               method='live-browser-official-search', facts='30粒意式浓缩胶囊，页面报价99元；与S1按兼容胶囊采购场景搭配。')
    by_id['capsule-coffee-s1']['accessories'] = [dict(name=capsule['name'], necessity='consumable',
        quote=dict(amount=99, currency='CNY', kind='official-search-listed', sourceId=capsule_sid,
                   url=capsule['source'], capturedAt=DATE), requiredWhen=capsule['condition'],
        note='30粒一盒，不是单杯或单粒价格。')]
    by_id['capsule-coffee-s1']['purchaseScenario'] = '没有现成兼容胶囊，另购Café Royal 30粒意式浓缩；设备及耗材均满足官网普通配送免邮门槛。'
    compatibility_sid = 'jd-mi-capsule-compatibility'
    sources[compatibility_sid] = dict(id=compatibility_sid, title='京东自营：米家咖啡机与Café Royal 30粒组合',
        url='https://www.jd.com/zuozhe/61966c2c781b8299d558.html', capturedAt=DATE,
        method='primary-retailer-category-page-opened',
        facts='自营分类页列出米家胶囊咖啡机S1＋Cafe Royal意式浓缩30粒组合，以及米家便携咖啡机白/灰色＋同款胶囊组合。用于组合适配证据，不作为99元单独胶囊价格来源。')
    by_id['capsule-coffee-s1']['accessories'][0]['compatibilitySourceId'] = compatibility_sid
    by_id['portable-coffee']['compatibilitySourceId'] = compatibility_sid

    rental_input = load('research/rentals-updated.json')
    if (ROOT / 'research/rentals-additional.json').exists():
        rental_input['products'].extend(load('research/rentals-additional.json')['products'])
    for record in rental_input['products']:
        item = by_id[record['productId']]
        item['rentalResearch'] = {key: value for key, value in record.items() if key not in ('rental', 'productId')}
        if record['rental'] is None:
            continue
        offer = copy.deepcopy(record['rental'])
        if record['productId'] == 'treadmill':
            offer['modelMatchNote'] = '同品类替代型号，不是本次采购的金史密斯WalkingPad R2。'
            offer['availablePlanDays'] = [365]
        if record['productId'] == 'coffee-machine':
            offer['availablePlanDays'] = [30, 60, 90, 120, 180, 365]
        if record['productId'] == 'tent':
            offer['modelMatchNote'] = '双人露营帐篷替代款，不是本次采购的迪卡侬搭建式帐篷。'
        offer['status'] = record['status']
        item['rental'] = offer
        sid = offer['sourceId']
        sources[sid] = dict(id=sid, title=offer['merchant'] + '：' + offer['model'],
                           url=offer['source']['url'], capturedAt=DATE, method=offer['evidenceLevel'],
                           facts=rental_summary(offer) + ' ' + offer['priceCondition'])
    for item in items:
        if item.get('family') == 'projector':
            item['rental'] = copy.deepcopy(projector['rental'])
            item['rental']['modelMatch'] = False
        if not item.get('rental', {}).get('kind'):
            item['rental'] = dict(kind=None, status='no-offer-selected', pricePerDay=None,
                                  currency='CNY', sourceId=None, note='未配置已核验的租赁；使用借用或已有设备替代，不声称市场无租赁。')
        item['readyForDirectImport'] = True
        item['editorialUsageIsMeasured'] = False
        item['stock'] = item.get('stock', '页面列示价格，未确认目标日期和地址库存')
        if item['id'] in {p['id'] for p in updates['products']} and item['id'] != 'coffee-machine':
            item['stock'] = '报价页列示，未确认目标日期和地址库存'
        assert item['shipping']['amount'] is not None

    dusty = load('research/projector-dusty.json')
    images['projector-dusty'] = image_record('projector-dusty', dusty['file'], origin='ai-generated-illustration')
    images['projector-dusty'].update(disclosure=dusty['disclosure'], generationRecord='research/projector-dusty.json')

    runtime, terms = [], {}
    original_runtime = {p['id']: p for p in json.loads((REPO / 'src/data/products.json').read_text())}
    for item in items:
        ident = item['id']
        extras = [dict(name=a['name'], price=a['quote']['amount'], required=a['necessity'] in ('conditional', 'consumable'))
                  for a in item['accessories'] if a['necessity'] != 'included' and a['quote']['amount'] is not None]
        alternatives = {key: value for key, value in original_runtime.get(ident, {}).get('alternatives', {}).items() if key != 'rent'}
        alternatives.setdefault('existing', '先评估已有设备是否已经满足需求')
        offer = item['rental']
        if offer.get('kind') == 'equipment-rental' and offer.get('pricePerDay') is not None:
            alternatives['rent'] = dict(pricePerDay=offer['pricePerDay'], where=rental_summary(offer))
        photos = dict(unboxed='/products/' + Path(item['image']).name)
        if item.get('dustyImage'):
            photos['dusty'] = '/products/' + Path(item['dustyImage']).name
        runtime.append(dict(id=ident, name=item['name'], category=item['category'], price=item['price']['amount'],
                            images=photos, accessories=extras, shipping=item['shipping']['amount'],
                            alternatives=alternatives, typicalUsage=item['editorialUsage'], source=item['source']))
        terms[ident] = dict(quoteLabel=LABELS[item['price']['kind']], priceNote=item['price'].get('note', ''),
                           scenario=item['purchaseScenario'], shippingCondition=shipping_conditions(item),
                           rentalSummary=rental_summary(offer), rental=offer,
                           imageNote='AI生成的闲置情境示意，不是真实测评。' if item.get('dustyImage') else '',
                           sourceIds=list(dict.fromkeys([item['price']['sourceId'], item['shipping']['sourceId']])))

    save('data/products.researched.json', dict(schemaVersion=2, capturedAt=DATE, currency='CNY',
         scope='source-backed-simulation-catalog-with-explicit-conditions', products=items))
    save('data/products.runtime.json', runtime)
    save('data/product-details.json', terms)
    save('sources/sources.json', list(sources.values()))
    save('sources/images.json', list(images.values()))
    totals = {p['id']: round(p['price'] + p['shipping'] + sum(a['price'] for a in p['accessories'] if a['required']), 2) for p in runtime}
    csv_save('products.csv', ['ID', '商品与规格', '类目', '报价_CNY', '报价性质', '采购场景', '运费_CNY', '本场景总价_CNY', '运费适用条件', '租赁或服务替代', '来源', '采集日期', '本地图片'], [
        [p['id'], p['name'], p['category'], p['price']['amount'], LABELS[p['price']['kind']], p['purchaseScenario'],
         p['shipping']['amount'], totals[p['id']], shipping_conditions(p), rental_summary(p['rental']), p['source']['url'], DATE, p['image']] for p in items])
    csv_save('accessories.csv', ['商品ID', '配件或耗材', '必要性', '报价_CNY', '来源', '适用条件'], [
        [p['id'], a['name'], a['necessity'], a['quote']['amount'] if a['quote']['amount'] is not None else '不另购',
         a['quote'].get('url', ''), a.get('requiredWhen', a.get('note', ''))] for p in items for a in p['accessories']])
    rental_rows = []
    for p in items:
        r = p['rental']
        rental_rows.append([p['id'], r.get('kind') or '未选用租赁', r.get('model', ''), r.get('pricePerDay', ''),
                           r.get('minimumDays', ''), r.get('pricePerHour', ''), r.get('packagePrice', ''),
                           r.get('packageDaysIncluded', ''), r.get('extraDayPrice', ''), r.get('deposit', ''),
                           r.get('serviceArea', ''), r.get('source', {}).get('url', ''), rental_summary(r)])
    csv_save('rentals.csv', ['商品ID', '方案类型', '实际型号或服务', '挂牌日租_CNY', '最低天数', '小时价_CNY', '套餐价_CNY', '套餐内天数', '超期日价_CNY', '押金_CNY', '地区', '来源', '完整条件'], rental_rows)

    active_sources = {p['price']['sourceId'] for p in items}
    source_md = ['# 来源索引', '', f'采集日期：{DATE}。报价是页面证据，不是实际订单；包含当前引用和保留的历史研究来源。', '']
    for s in sources.values():
        source_md.extend(['## ' + s['id'], '', f"[{s['title']}]({s['url']})", '',
                          f"方式：`{s['method']}`；{'当前主商品报价来源' if s['id'] in active_sources else '配件、政策、租赁、规格或历史研究来源'}。", '', s['facts'], ''])
    (ROOT / 'sources/README.md').write_text('\n'.join(source_md))
    build_gallery(items, terms)

    # Copy reviewed artifacts into the local application; no network runs at runtime.
    for filename in ('products.runtime.json', 'product-details.json'):
        target = 'products.json' if filename == 'products.runtime.json' else filename
        shutil.copyfile(ROOT / 'data' / filename, REPO / 'src/data' / target)
    public = REPO / 'public/products'
    public.mkdir(exist_ok=True)
    for p in items:
        for relative in (p['image'], p.get('dustyImage')):
            if relative:
                shutil.copyfile(ROOT / relative, public / Path(relative).name)
    print(f'Built {len(items)} products, {sum(len(p["accessories"]) for p in items)} accessory records, {len(images)} provenance records.')


def build_gallery(items, terms):
    esc = html.escape
    cards = []
    for p in items:
        detail = terms[p['id']]
        accessories = ''.join(f"<li>{esc(a['name'])}：{'已内置' if a['necessity']=='included' else '¥'+str(a['quote']['amount'])}；{esc(a.get('requiredWhen',a.get('note','')))}</li>" for a in p['accessories'])
        after = f'<figure><img src="{p["dustyImage"]}" alt="AI生成的投影仪闲置情境"><figcaption>AI生成的闲置情境示意，不是真实测评</figcaption></figure>' if p.get('dustyImage') else ''
        cards.append(f'''<article data-search="{esc(p['name']+' '+p['category']+' '+p['id'])}" data-category="{esc(p['category'])}"><div class="picture"><img src="{esc(p['image'])}" alt="{esc(p['name'])}" loading="lazy"></div><div class="body"><small>{esc(p['category'])} / {esc(p['id'])}</small><h2>{esc(p['name'])}</h2><p class="price">¥{p['price']['amount']:g} <span>{esc(detail['quoteLabel'])}</span></p><p>{esc(detail['priceNote'])}</p><p>{esc(p['purchaseScenario'])}</p><details><summary>配件、运费与租赁条件</summary><ul>{accessories or '<li>基础场景无需另购配件</li>'}</ul><p>运费 ¥{p['shipping']['amount']:g}，仅适用于：{esc(detail['shippingCondition'])}</p><p>{esc(detail['rentalSummary'])}</p>{after}</details><a href="{esc(p['source']['url'])}" target="_blank" rel="noreferrer">报价来源 ↗</a></div></article>''')
    options = ''.join(f'<option>{esc(category)}</option>' for category in dict.fromkeys(p['category'] for p in items))
    (ROOT / 'index.html').write_text('''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CRAZYMIKE · 25款商品资料</title><style>
:root{color-scheme:light;--oa:#22344a;--muted:#68707c;--bg:#f4f5f7;--line:#dfe3e8}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--oa);font:15px/1.7 system-ui,sans-serif}main{max-width:1160px;margin:auto;padding:36px 22px}header{margin-bottom:28px}h1{font-size:36px;margin:8px 0}nav,.filters{display:flex;gap:16px;flex-wrap:wrap;margin:16px 0}a{color:var(--oa);text-underline-offset:4px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:20px}article{background:white;border:1px solid var(--line);border-radius:14px;overflow:hidden}article[hidden]{display:none}.picture{height:250px;padding:20px;border-bottom:1px solid var(--line)}img{width:100%;height:100%;object-fit:contain}.body{padding:20px}h2{font-size:18px;min-height:54px;margin:8px 0}.price{font-size:28px;font-weight:700;margin:10px 0}.price span,small,figcaption{font-size:12px;font-weight:400;color:var(--muted)}details{margin:15px 0}summary{cursor:pointer}ul{padding-left:20px}figure{margin:16px 0}input,select{padding:10px 14px;border:1px solid var(--line);border-radius:8px;background:white;font:inherit}input{flex:1;min-width:160px}footer{margin-top:30px;color:var(--muted)}@media(max-width:600px){main{padding:24px 16px}h1{font-size:30px}}
</style><main><header><small>CPX 2026 / CRAZYMIKE / 2026-11-21</small><h1>从想买，到算清楚</h1><p>25款商品，覆盖影音、健身、厨房、数码、乐器、户外与游戏。每条均保留报价类型、来源和采购场景。所有订单仅为模拟。</p><p>运费按公开配送条件记录；租赁分别标明同型号或替代型号、日租或套餐、起租期、押金和地区。没有把到店练鼓费用写成设备日租。</p><nav><a href="README.md">交接说明</a><a href="data/products.csv">商品表</a><a href="data/accessories.csv">配件表</a><a href="data/rentals.csv">租赁表</a><a href="sources/README.md">来源索引</a></nav><div class="filters"><input id="search" aria-label="搜索商品" placeholder="搜索名称、品类或ID"><select id="category" aria-label="商品品类"><option value="">全部品类</option>'''+options+'''</select></div><p id="count" aria-live="polite">共25款</p></header><section class="grid">'''+''.join(cards)+'''</section><footer>价格快照不保证持续有效或有货。商品图来自原网页并保留标识；积灰场景由内置image_gen生成且单独标注。来源、采集日期、文件校验值均已保存。全部图片本地存储，离线可查看。</footer></main><script>
const search=document.getElementById('search'),category=document.getElementById('category');function filter(){let count=0;document.querySelectorAll('article').forEach(card=>{card.hidden=!(card.dataset.search.toLowerCase().includes(search.value.trim().toLowerCase())&&(!category.value||card.dataset.category===category.value));if(!card.hidden)count++});document.getElementById('count').textContent='显示'+count+'款'}search.addEventListener('input',filter);category.addEventListener('change',filter);
</script></html>''')


if __name__ == '__main__':
    main()
