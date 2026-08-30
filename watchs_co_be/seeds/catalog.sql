BEGIN;

INSERT INTO brands (name, slug, description)
VALUES
  ('Rolex', 'rolex', 'Swiss tool watches and enduring collector icons.'),
  ('Audemars Piguet', 'audemars-piguet', 'Independent haute horlogerie from Le Brassus.'),
  ('Patek Philippe', 'patek-philippe', 'Genevan watchmaking with exceptional finishing and provenance.'),
  ('Omega', 'omega', 'Precision chronographs, dive watches, and space-tested instruments.'),
  ('Cartier', 'cartier', 'Parisian design icons balancing jewelry craft and watchmaking.'),
  ('Vacheron Constantin', 'vacheron-constantin', 'One of the oldest continuously operating Swiss manufactures.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = true,
  deleted_at = NULL;

INSERT INTO collections (name, slug, description, sort_order)
VALUES
  ('Professional', 'professional', 'Purpose-built sports and travel watches.', 10),
  ('Integrated Sports', 'integrated-sports', 'Sport-luxury watches with integrated bracelets.', 20),
  ('Complications', 'complications', 'Travel time, calendar, and chronograph complications.', 30),
  ('Icons', 'icons', 'Recognizable designs with enduring collector appeal.', 40)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  deleted_at = NULL;

INSERT INTO watches (
  brand_id, collection_id, brand, model, reference, sku, slug,
  complication, case_material, bracelet_material, dial,
  sale_price, msrp, stock_status, stock_quantity, movement, condition,
  case_size, water_resistance, power_reserve, description,
  short_description, is_active, is_featured
)
VALUES
  ((SELECT id FROM brands WHERE slug = 'rolex'),
   (SELECT id FROM collections WHERE slug = 'professional'),
   'Rolex', 'Cosmograph Daytona', '126500LN', 'MC-ROL-126500LN',
   'rolex-cosmograph-daytona-126500ln', 'Chronograph', 'Oystersteel',
   'Oystersteel', 'White', 34200.00, 15100.00, 'in_stock', 2,
   'Automatic calibre 4131', 'new', 40.00, '100 m', '72 hours',
   'The latest-generation steel Daytona with ceramic bezel and calibre 4131.',
   '2024 steel Daytona with box, papers, and insured delivery.', true, true),

  ((SELECT id FROM brands WHERE slug = 'audemars-piguet'),
   (SELECT id FROM collections WHERE slug = 'integrated-sports'),
   'Audemars Piguet', 'Royal Oak Selfwinding', '15510ST.OO.1320ST.06',
   'MC-AP-15510ST', 'audemars-piguet-royal-oak-15510st', 'Time and date',
   'Stainless steel', 'Stainless steel', 'Blue Grande Tapisserie',
   59900.00, 28200.00, 'in_stock', 1, 'Automatic calibre 4302', 'new',
   41.00, '50 m', '70 hours',
   'A modern Royal Oak with the signature integrated bracelet and blue dial.',
   'Unworn 41mm Royal Oak with manufacturer warranty.', true, true),

  ((SELECT id FROM brands WHERE slug = 'patek-philippe'),
   (SELECT id FROM collections WHERE slug = 'complications'),
   'Patek Philippe', 'Aquanaut Travel Time', '5164R-001', 'MC-PP-5164R',
   'patek-philippe-aquanaut-travel-time-5164r', 'Dual time and date',
   'Rose gold', 'Composite strap', 'Brown embossed', 129000.00, 65000.00,
   'in_stock', 1, 'Automatic calibre 26-330 S C FUS', 'new', 40.80,
   '30 m', '45 hours',
   'A rose-gold Aquanaut combining dual-time functionality with casual luxury.',
   'Full-set Aquanaut Travel Time in rose gold.', true, true),

  ((SELECT id FROM brands WHERE slug = 'omega'),
   (SELECT id FROM collections WHERE slug = 'professional'),
   'Omega', 'Speedmaster Moonwatch Professional', '310.30.42.50.01.002',
   'MC-OMG-31030425001002', 'omega-speedmaster-moonwatch-professional-sapphire',
   'Chronograph', 'Stainless steel', 'Stainless steel', 'Black step dial',
   7250.00, 8000.00, 'in_stock', 5, 'Manual-wind calibre 3861', 'new',
   42.00, '50 m', '50 hours',
   'Master Chronometer Moonwatch with sapphire crystal and exhibition back.',
   'Current-generation sapphire Moonwatch with full set.', true, true),

  ((SELECT id FROM brands WHERE slug = 'cartier'),
   (SELECT id FROM collections WHERE slug = 'icons'),
   'Cartier', 'Santos de Cartier', 'WSSA0018', 'MC-CAR-WSSA0018',
   'cartier-santos-de-cartier-large', 'Time and date', 'Stainless steel',
   'Stainless steel', 'Silvered opaline', 7450.00, 7750.00, 'in_stock', 4,
   'Automatic calibre 1847 MC', 'new', 39.80, '100 m', '42 hours',
   'The large Santos pairs architectural proportions with a quick-change bracelet.',
   'Large steel Santos with bracelet and leather strap.', true, false),

  ((SELECT id FROM brands WHERE slug = 'vacheron-constantin'),
   (SELECT id FROM collections WHERE slug = 'integrated-sports'),
   'Vacheron Constantin', 'Overseas Self-Winding', '4500V/110A-B128',
   'MC-VC-4500V', 'vacheron-constantin-overseas-4500v-blue', 'Time and date',
   'Stainless steel', 'Stainless steel', 'Blue lacquered', 32900.00, 25000.00,
   'in_stock', 1, 'Automatic calibre 5100', 'pre_owned', 41.00, '150 m',
   '60 hours',
   'A versatile blue-dial Overseas supplied with interchangeable bracelet and straps.',
   'Collector-owned Overseas with complete accessories.', true, false)
ON CONFLICT (slug) DO UPDATE SET
  sale_price = EXCLUDED.sale_price,
  msrp = EXCLUDED.msrp,
  stock_status = EXCLUDED.stock_status,
  stock_quantity = EXCLUDED.stock_quantity,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  is_active = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured,
  deleted_at = NULL;

INSERT INTO assets (watch_id, url, type, alt_text, sort_order)
SELECT w.id, seed.url, 'image', seed.alt_text, 0
FROM (VALUES
  ('rolex-cosmograph-daytona-126500ln', '/images/hero3.png', 'Rolex Cosmograph Daytona 126500LN'),
  ('audemars-piguet-royal-oak-15510st', '/images/hero2.png', 'Audemars Piguet Royal Oak 15510ST'),
  ('patek-philippe-aquanaut-travel-time-5164r', '/images/hero1.png', 'Patek Philippe Aquanaut Travel Time 5164R'),
  ('omega-speedmaster-moonwatch-professional-sapphire', '/images/hero3.png', 'Omega Speedmaster Moonwatch Professional'),
  ('cartier-santos-de-cartier-large', '/images/hero1.png', 'Cartier Santos de Cartier'),
  ('vacheron-constantin-overseas-4500v-blue', '/images/hero2.png', 'Vacheron Constantin Overseas')
) AS seed(slug, url, alt_text)
JOIN watches w ON w.slug = seed.slug
WHERE NOT EXISTS (
  SELECT 1 FROM assets a WHERE a.watch_id = w.id AND a.url = seed.url
);

COMMIT;
