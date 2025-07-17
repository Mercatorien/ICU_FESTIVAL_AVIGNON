CREATE TABLE THEATRE (
    id_t SERIAL PRIMARY KEY,
    nom_t VARCHAR(255) NOT NULL,
    adresse VARCHAR(255),
    site_internet VARCHAR(255),
    capacite INT CHECK (capacite >= 0),
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    source_capacite VARCHAR(255),
    notes TEXT,
    geom geometry(Point, 4326) 
);

CREATE TABLE SPECTACLE (
    id_s SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL
);

CREATE TABLE R_SPECT_DATE (
    id_r SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    id_t INT NOT NULL REFERENCES THEATRE(id_t) ON DELETE CASCADE,
    id_s INT NOT NULL REFERENCES SPECTACLE(id_s) ON DELETE CASCADE
);


CREATE OR REPLACE VIEW public.v_theatre_avec_spectacle
 AS
 SELECT t.id_t,
    t.nom_t,
    t.adresse,
    t.site_internet,
    t.capacite,
    t.x,
    t.y,
    t.source_capacite,
    t.notes,
    t.geom,
    COALESCE(count(DISTINCT r.id_s), 0::bigint) AS nb_spectacles,
    COALESCE(t.capacite * count(DISTINCT r.id_s), 0::bigint) AS nb_pers_acc
   FROM theatre t
     LEFT JOIN r_spect_date r ON t.id_t = r.id_t
  GROUP BY t.id_t, t.nom_t, t.adresse, t.site_internet, t.capacite, t.x, t.y, t.source_capacite, t.notes, t.geom;

ALTER TABLE public.v_theatre_avec_spectacle
    OWNER TO postgres;

