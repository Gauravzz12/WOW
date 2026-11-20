-- Waiting Room capacity: hard backstop for WAITING_ROOM_CAPACITY
-- (src/lib/queueCapacity.ts, currently 100 — keep the literal below in
-- sync). The create action counts Sponsored-tier PENDING_PAYMENT rows
-- and refuses first; this BEFORE INSERT trigger closes the
-- count-then-insert race so two simultaneous creates cannot both slip
-- into a full room.
--
-- A row belongs to the Waiting Room under exactly the definition the
-- Waiting Room page queries: status PENDING_PAYMENT, not a reserved
-- slot, and style_config.isSponsored = true.
--
-- The create action maps the 'waiting_room_full' exception message to
-- its friendly capacity error.

create or replace function public.enforce_waiting_room_capacity()
returns trigger
language plpgsql
as $$
declare
  waiting_count integer;
begin
  if new.status = 'PENDING_PAYMENT'
     and new.is_reserved_slot = false
     and coalesce(new.style_config->>'isSponsored', 'false') = 'true' then
    select count(*) into waiting_count
    from public.messages
    where status = 'PENDING_PAYMENT'
      and is_reserved_slot = false
      and coalesce(style_config->>'isSponsored', 'false') = 'true';
    if waiting_count >= 100 then
      raise exception 'waiting_room_full';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_waiting_room_capacity on public.messages;

create trigger trg_waiting_room_capacity
  before insert on public.messages
  for each row
  execute function public.enforce_waiting_room_capacity();
