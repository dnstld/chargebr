alter table public.events
  drop constraint events_event_phase_valid;

alter table public.events
  add constraint events_event_phase_valid
  check (
    event_phase in (
      'announcement',
      'approval',
      'publication',
      'effective',
      'expiry',
      'occurrence',
      'update'
    )
  );

comment on column public.events.event_phase is
  'Etapa temporal distinguida como anúncio, aprovação, publicação, vigência, encerramento de vigência, realização ou atualização.';
