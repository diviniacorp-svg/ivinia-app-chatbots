alter table public.cl_quote_versions add column customer_phone text not null default '';
create table public.cl_labor_rates (job text primary key, labor_ars integer check(labor_ars>=0), position integer not null);
alter table public.cl_labor_rates enable row level security;
revoke all on public.cl_labor_rates from public, anon, authenticated;
grant select, update on public.cl_labor_rates to service_role;
insert into public.cl_labor_rates(job,position) values ('Revisión',0),
('Cambio de módulo',1),
('Cambio de puerto de carga',2),
('Cambio de batería',3),
('Cambio de vidrio de cámara',4),
('Cambio de cámara',5),
('Cambio de flex',6),
('Limpieza interna de parlantes, puertos y cámaras',7),
('Cambio de tapa trasera (excepto iPhone)',8),
('Recuperación de cuenta comprometida',9),
('Equipo que no enciende',10),
('Equipo mojado / baño químico',11),
('Software',12),
('Cuenta de Google',13),
('Microsoldadura',14),
('Circuito integrado CPU',15),
('Circuito integrado OVP',16),
('Circuito integrado PMIC',17),
('Circuito integrado IFPMIC',18),
('Cambio de micrófono',19),
('Cambio de parlante auricular',20),
('Cambio de parlante buzzer',21),
('Cambio de botones',22),
('Cambio de sensor de huella',23);