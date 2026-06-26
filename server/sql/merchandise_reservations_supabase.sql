create extension if not exists pgcrypto;

create table if not exists merch_products (
  sku text primary key,
  name text not null,
  total_quantity integer not null check (total_quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table merch_products
  add column if not exists product_type text not null default 'individual';

alter table merch_products
  add column if not exists sort_order integer;

alter table merch_products
  add column if not exists price_usd numeric(10, 2) not null default 0;

create table if not exists merch_bundle_components (
  bundle_sku text not null references merch_products(sku) on delete cascade,
  component_sku text not null references merch_products(sku) on delete restrict,
  component_quantity integer not null check (component_quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (bundle_sku, component_sku)
);

create table if not exists merch_reservations (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  status text not null default 'reserved' check (status in ('reserved', 'cancelled', 'fulfilled')),
  created_at timestamptz not null default now()
);

create table if not exists merch_reservation_items (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references merch_reservations(id) on delete cascade,
  sku text not null references merch_products(sku),
  product_name text not null,
  size text not null,
  color text not null,
  quantity integer not null check (quantity > 0)
);

insert into merch_products (sku, name, total_quantity, price_usd, product_type, sort_order)
values
  ('MERCH-001', 'Circular Josephite Magnet', 40, 5, 'individual', 1),
  ('MERCH-002', 'Sticker Set', 50, 5, 'individual', 2),
  ('MERCH-003', 'Luggage Tag', 50, 5, 'individual', 3),
  ('MERCH-004', 'School Crest Lapel Pin', 40, 10, 'individual', 4),
  ('MERCH-005', 'Davids Cufflinks', 20, 10, 'individual', 5),
  ('MERCH-006', 'Georges Cufflinks', 20, 10, 'individual', 6),
  ('MERCH-007', 'Andrews Cufflinks', 20, 10, 'individual', 7),
  ('MERCH-008', 'Patricks Cufflinks', 20, 10, 'individual', 8),
  ('MERCH-009', 'Andrews Badge', 20, 10, 'individual', 9),
  ('MERCH-010', 'Davids Badge', 20, 10, 'individual', 10),
  ('MERCH-011', 'Georges Badge', 20, 10, 'individual', 11),
  ('MERCH-012', 'Patricks Badge', 20, 10, 'individual', 12),
  ('MERCH-013', 'Andrews Tie Pin - Blue', 20, 10, 'individual', 13),
  ('MERCH-014', 'Davids Tie Pin - Yellow', 20, 10, 'individual', 14),
  ('MERCH-015', 'Georges Tie Pin - Red', 20, 10, 'individual', 15),
  ('MERCH-016', 'Patricks Tie Pin - Green', 20, 10, 'individual', 16),
  ('MERCH-017', 'Coffee Table Book - 100 Years', 20, 40, 'individual', 17),
  ('MERCH-018', 'Faith & Toil Book - 150 Years', 20, 40, 'individual', 18),
  ('MERCH-019', 'Paul Fernandes Framed Print (without glass)', 20, 40, 'individual', 19),
  ('MERCH-020', 'Laptop Bag', 15, 40, 'individual', 20),
  ('MERCH-021', 'Laptop Sleeve', 15, 30, 'individual', 21),
  ('MERCH-022', 'Metal Water Bottle', 30, 20, 'individual', 22),
  ('MERCH-023', 'Bamboo Water Sipper', 30, 40, 'individual', 23),
  ('MERCH-024', 'Scarf', 30, 20, 'individual', 24),
  ('MERCH-025', 'Cap', 30, 20, 'individual', 25),
  ('BUNDLE-001', 'Josephite Starter Bundle', 40, 20, 'bundle', 101),
  ('BUNDLE-002', 'Alumni Essentials Bundle', 30, 45, 'bundle', 102),
  ('BUNDLE-003', 'Work & Travel Bundle', 15, 55, 'bundle', 103),
  ('BUNDLE-004', 'Heritage Bundle', 20, 70, 'bundle', 104),
  ('BUNDLE-005', 'Art & Memory Bundle', 20, 45, 'bundle', 105),
  ('BUNDLE-006', 'Premium Josephite Gift Bundle', 20, 110, 'bundle', 106),
  ('BUNDLE-007', 'Andrews House Pride Bundle', 20, 25, 'bundle', 107),
  ('BUNDLE-008', 'Davids House Pride Bundle', 20, 25, 'bundle', 108),
  ('BUNDLE-009', 'Georges House Pride Bundle', 20, 25, 'bundle', 109),
  ('BUNDLE-010', 'Patricks House Pride Bundle', 20, 25, 'bundle', 110),
  ('BUNDLE-011', 'Davids Premium House Bundle', 20, 35, 'bundle', 111),
  ('BUNDLE-012', 'Georges Premium House Bundle', 20, 35, 'bundle', 112),
  ('BUNDLE-013', 'Patricks Premium House Bundle', 20, 35, 'bundle', 113),
  ('BUNDLE-014', 'Andrews Premium House Bundle', 20, 35, 'bundle', 114)
on conflict (sku) do update
set
  name = excluded.name,
  total_quantity = excluded.total_quantity,
  price_usd = excluded.price_usd,
  product_type = excluded.product_type,
  sort_order = excluded.sort_order,
  updated_at = now();

delete from merch_bundle_components
where bundle_sku in (
  'BUNDLE-001', 'BUNDLE-002', 'BUNDLE-003', 'BUNDLE-004', 'BUNDLE-005', 'BUNDLE-006', 'BUNDLE-007',
  'BUNDLE-008', 'BUNDLE-009', 'BUNDLE-010', 'BUNDLE-011', 'BUNDLE-012', 'BUNDLE-013', 'BUNDLE-014'
);

insert into merch_bundle_components (bundle_sku, component_sku, component_quantity)
values
  ('BUNDLE-001', 'MERCH-001', 1),
  ('BUNDLE-001', 'MERCH-002', 1),
  ('BUNDLE-001', 'MERCH-003', 1),
  ('BUNDLE-001', 'MERCH-004', 1),
  ('BUNDLE-002', 'MERCH-025', 1),
  ('BUNDLE-002', 'MERCH-022', 1),
  ('BUNDLE-002', 'MERCH-001', 1),
  ('BUNDLE-002', 'MERCH-002', 1),
  ('BUNDLE-002', 'MERCH-003', 1),
  ('BUNDLE-003', 'MERCH-021', 1),
  ('BUNDLE-003', 'MERCH-022', 1),
  ('BUNDLE-003', 'MERCH-003', 1),
  ('BUNDLE-003', 'MERCH-004', 1),
  ('BUNDLE-004', 'MERCH-017', 1),
  ('BUNDLE-004', 'MERCH-018', 1),
  ('BUNDLE-005', 'MERCH-019', 1),
  ('BUNDLE-005', 'MERCH-001', 1),
  ('BUNDLE-005', 'MERCH-002', 1),
  ('BUNDLE-005', 'MERCH-003', 1),
  ('BUNDLE-006', 'MERCH-017', 1),
  ('BUNDLE-006', 'MERCH-018', 1),
  ('BUNDLE-006', 'MERCH-004', 1),
  ('BUNDLE-006', 'MERCH-019', 1),
  ('BUNDLE-006', 'MERCH-001', 1),
  ('BUNDLE-007', 'MERCH-009', 1),
  ('BUNDLE-007', 'MERCH-013', 1),
  ('BUNDLE-007', 'MERCH-001', 1),
  ('BUNDLE-007', 'MERCH-002', 1),
  ('BUNDLE-008', 'MERCH-010', 1),
  ('BUNDLE-008', 'MERCH-014', 1),
  ('BUNDLE-008', 'MERCH-001', 1),
  ('BUNDLE-008', 'MERCH-002', 1),
  ('BUNDLE-009', 'MERCH-011', 1),
  ('BUNDLE-009', 'MERCH-015', 1),
  ('BUNDLE-009', 'MERCH-001', 1),
  ('BUNDLE-009', 'MERCH-002', 1),
  ('BUNDLE-010', 'MERCH-012', 1),
  ('BUNDLE-010', 'MERCH-016', 1),
  ('BUNDLE-010', 'MERCH-001', 1),
  ('BUNDLE-010', 'MERCH-002', 1),
  ('BUNDLE-011', 'MERCH-010', 1),
  ('BUNDLE-011', 'MERCH-014', 1),
  ('BUNDLE-011', 'MERCH-005', 1),
  ('BUNDLE-011', 'MERCH-001', 1),
  ('BUNDLE-011', 'MERCH-002', 1),
  ('BUNDLE-012', 'MERCH-011', 1),
  ('BUNDLE-012', 'MERCH-015', 1),
  ('BUNDLE-012', 'MERCH-006', 1),
  ('BUNDLE-012', 'MERCH-001', 1),
  ('BUNDLE-012', 'MERCH-002', 1),
  ('BUNDLE-013', 'MERCH-012', 1),
  ('BUNDLE-013', 'MERCH-016', 1),
  ('BUNDLE-013', 'MERCH-008', 1),
  ('BUNDLE-013', 'MERCH-001', 1),
  ('BUNDLE-013', 'MERCH-002', 1),
  ('BUNDLE-014', 'MERCH-009', 1),
  ('BUNDLE-014', 'MERCH-013', 1),
  ('BUNDLE-014', 'MERCH-004', 1),
  ('BUNDLE-014', 'MERCH-001', 1),
  ('BUNDLE-014', 'MERCH-002', 1)
on conflict (bundle_sku, component_sku) do update
set
  component_quantity = excluded.component_quantity,
  updated_at = now();

create or replace view merchandise_inventory_summary as
with active_items as (
  select item.sku, item.quantity
  from merch_reservation_items item
  join merch_reservations reservation on reservation.id = item.reservation_id
  where reservation.status = 'reserved'
),
reserved_components as (
  select item.sku, sum(item.quantity)::integer as reserved_quantity
  from active_items item
  join merch_products product on product.sku = item.sku and product.product_type = 'individual'
  group by item.sku
  union all
  select component.component_sku as sku, sum(item.quantity * component.component_quantity)::integer as reserved_quantity
  from active_items item
  join merch_bundle_components component on component.bundle_sku = item.sku
  group by component.component_sku
),
reserved_component_totals as (
  select sku, sum(reserved_quantity)::integer as reserved_quantity
  from reserved_components
  group by sku
),
individual_inventory as (
  select
    product.sku,
    product.name,
    product.total_quantity,
    coalesce(reserved.reserved_quantity, 0)::integer as reserved_quantity,
    greatest(product.total_quantity - coalesce(reserved.reserved_quantity, 0), 0)::integer as available_quantity,
    product.price_usd,
    product.sort_order
  from merch_products product
  left join reserved_component_totals reserved on reserved.sku = product.sku
  where product.product_type = 'individual'
),
bundle_direct_reservations as (
  select item.sku, sum(item.quantity)::integer as reserved_quantity
  from active_items item
  join merch_products product on product.sku = item.sku and product.product_type = 'bundle'
  group by item.sku
),
bundle_inventory as (
  select
    bundle.sku,
    bundle.name,
    min(floor(individual.total_quantity::numeric / component.component_quantity))::integer as total_quantity,
    coalesce(direct.reserved_quantity, 0)::integer as reserved_quantity,
    min(floor(individual.available_quantity::numeric / component.component_quantity))::integer as available_quantity,
    bundle.price_usd,
    bundle.sort_order
  from merch_products bundle
  join merch_bundle_components component on component.bundle_sku = bundle.sku
  join individual_inventory individual on individual.sku = component.component_sku
  left join bundle_direct_reservations direct on direct.sku = bundle.sku
  where bundle.product_type = 'bundle'
  group by bundle.sku, bundle.name, direct.reserved_quantity, bundle.price_usd, bundle.sort_order
)
select sku, name, total_quantity, reserved_quantity, available_quantity, price_usd
from individual_inventory
union all
select sku, name, total_quantity, reserved_quantity, available_quantity, price_usd
from bundle_inventory
order by sku;

create or replace function reserve_merchandise_order(reservation_payload jsonb)
returns jsonb
language plpgsql
security definer
as $$
declare
  customer_name text := trim(coalesce(reservation_payload #>> '{customer,name}', ''));
  customer_email text := lower(trim(coalesce(reservation_payload #>> '{customer,email}', '')));
  customer_phone text := nullif(trim(coalesce(reservation_payload #>> '{customer,phone}', '')), '');
  created_reservation merch_reservations%rowtype;
  requested record;
  selected_product merch_products%rowtype;
  reserved_count integer;
  available_count integer;
begin
  if customer_name = '' then
    raise exception 'Enter your name before reserving merchandise.';
  end if;

  if customer_email = '' then
    raise exception 'Enter your email before reserving merchandise.';
  end if;

  if jsonb_typeof(reservation_payload -> 'items') <> 'array' or jsonb_array_length(reservation_payload -> 'items') = 0 then
    raise exception 'Add at least one item before placing an order.';
  end if;

  for requested in
    select
      item.sku,
      product.name,
      sum(item.quantity)::integer as quantity
    from jsonb_to_recordset(reservation_payload -> 'items') as item(
      sku text,
      size text,
      color text,
      quantity integer
    )
    left join merch_products product on product.sku = item.sku
    group by item.sku, product.name
  loop
    if requested.name is null then
      raise exception 'One of the selected products is no longer available.';
    end if;

    if requested.quantity is null or requested.quantity <= 0 then
      raise exception 'Enter a valid quantity for %.', requested.name;
    end if;
  end loop;

  for requested in
    with incoming as (
      select
        item.sku,
        sum(item.quantity)::integer as quantity
      from jsonb_to_recordset(reservation_payload -> 'items') as item(
        sku text,
        size text,
        color text,
        quantity integer
      )
      group by item.sku
    ),
    expanded as (
      select incoming.sku, incoming.quantity
      from incoming
      join merch_products product on product.sku = incoming.sku and product.product_type = 'individual'
      union all
      select
        component.component_sku as sku,
        sum(incoming.quantity * component.component_quantity)::integer as quantity
      from incoming
      join merch_bundle_components component on component.bundle_sku = incoming.sku
      group by component.component_sku
    )
    select
      expanded.sku,
      sum(expanded.quantity)::integer as quantity
    from expanded
    group by expanded.sku
  loop
    select *
    into selected_product
    from merch_products
    where sku = requested.sku
    for update;

    if not found then
      raise exception 'One of the selected products is no longer available.';
    end if;

    select coalesce(sum(
      case
        when item.sku = requested.sku then item.quantity
        when component.component_sku = requested.sku then item.quantity * component.component_quantity
        else 0
      end
    ), 0)::integer
    into reserved_count
    from merch_reservation_items item
    join merch_reservations reservation on reservation.id = item.reservation_id
    left join merch_bundle_components component on component.bundle_sku = item.sku
    where reservation.status = 'reserved'
      and (item.sku = requested.sku or component.component_sku = requested.sku);

    available_count := greatest(selected_product.total_quantity - reserved_count, 0);

    if requested.quantity > available_count then
      raise exception 'Only % % % left.',
        available_count,
        selected_product.name,
        case when available_count = 1 then 'is' else 'are' end;
    end if;
  end loop;

  insert into merch_reservations (customer_name, customer_email, customer_phone)
  values (customer_name, customer_email, customer_phone)
  returning * into created_reservation;

  insert into merch_reservation_items (reservation_id, sku, product_name, size, color, quantity)
  select
    created_reservation.id,
    item.sku,
    product.name,
    coalesce(nullif(trim(item.size), ''), 'Standard'),
    coalesce(nullif(trim(item.color), ''), 'Default'),
    item.quantity
  from jsonb_to_recordset(reservation_payload -> 'items') as item(
    sku text,
    size text,
    color text,
    quantity integer
  )
  join merch_products product on product.sku = item.sku;

  return jsonb_build_object(
    'reservation',
    jsonb_build_object(
      'id', created_reservation.id,
      'createdAt', created_reservation.created_at,
      'status', created_reservation.status,
      'customer', jsonb_build_object(
        'name', created_reservation.customer_name,
        'email', created_reservation.customer_email,
        'phone', created_reservation.customer_phone
      ),
      'items', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'sku', item.sku,
          'name', item.product_name,
          'size', item.size,
          'color', item.color,
          'quantity', item.quantity
        ) order by item.sku), '[]'::jsonb)
        from merch_reservation_items item
        where item.reservation_id = created_reservation.id
      )
    ),
    'inventory',
    (
      select coalesce(jsonb_agg(to_jsonb(summary) order by summary.sku), '[]'::jsonb)
      from merchandise_inventory_summary summary
    )
  );
end;
$$;
