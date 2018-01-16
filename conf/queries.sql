q1. select count(*) from product p JOIN offer o on o.product = p.nr join producer pcr on p.producer = pcr.nr;

q2. select count(*) from product p JOIN offer o on o.product = p.nr join producer pcr on p.producer = pcr.nr join review r on r.product = p.nr;

q3. select count(*) from product p JOIN offer o on o.product = p.nr join producer pcr on p.producer = pcr.nr join review r on r.product = p.nr join person pr on r.person = pr.nr;

q4. select count(*) from product p JOIN offer o on o.product = p.nr join producer pcr on p.producer = pcr.nr join review r on r.product = p.nr join person pr on r.person = pr.nr where r.language = "en";

********

q1. select count(*) from (select p.label, pcr.country, pcr.homepage from product p JOIN producer pcr on p.producer = pcr.nr where pcr.country = "DE") q1;

q2. select count(*) from (select p.label, pcr.country, r.language from product p JOIN producer pcr on p.producer = pcr.nr JOIN review r on r.product = p.nr where pcr.country = "DE") q2;

q3. select count(*) from (select p.label, pcr.country, r.language from product p JOIN producer pcr on p.producer = pcr.nr JOIN review r on r.product = p.nr join person pr on r.person = pr.nr where pcr.country = "DE") q3;
