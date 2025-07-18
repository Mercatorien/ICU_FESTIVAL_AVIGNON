library(terra)
library(sf)
library(stringr)

# === Paramètres ===
racine <- ""
output_dir <- file.path(racine, "0_LST")
dir.create(output_dir, showWarnings = FALSE)
emprise_gpkg <- ".gpkg"
emprise <- st_read(emprise_gpkg)

# === Liste des sous-dossiers années (2013 à 2025)
annees <- as.character(2013:2025)
dates_acquisition <- c()

# === Boucle sur chaque année
for (annee in annees) {
  dossier <- file.path(racine, annee)
  cat("🔄 Traitement de l'année :", annee, "\n")
  
  # === Fichier MTL
  mtl_path <- list.files(dossier, pattern = "_MTL.txt$", full.names = TRUE)
  if (length(mtl_path) == 0) {
    warning(paste("⚠️ MTL non trouvé pour", annee))
    next
  }
  mtl_text <- paste(readLines(mtl_path), collapse = "\n")
  
  # === Fonction pour extraire les valeurs MTL
  extract_mtl_value <- function(text, key) {
    match <- str_match(text, paste0(key, " *= *\"?([0-9E\\.\\-]+)\"?"))
    if (is.na(match[1,2])) stop(paste("❌ Clé non trouvée :", key))
    return(as.numeric(match[1,2]))
  }
  
  # === Constantes pour la bande 10
  ML <- extract_mtl_value(mtl_text, "RADIANCE_MULT_BAND_10")
  AL <- extract_mtl_value(mtl_text, "RADIANCE_ADD_BAND_10")
  K1 <- extract_mtl_value(mtl_text, "K1_CONSTANT_BAND_10")
  K2 <- extract_mtl_value(mtl_text, "K2_CONSTANT_BAND_10")
  
  # === Fichier B10
  b10_file <- list.files(dossier, pattern = "_B10.TIF$", full.names = TRUE)
  if (length(b10_file) == 0) {
    warning(paste("⚠️ Bande 10 non trouvée pour", annee))
    next
  }
  b10 <- rast(b10_file)
  
  # === Reprojeter l’emprise si nécessaire
  if (!st_crs(emprise) == crs(b10)) {
    emprise_proj <- st_transform(emprise, crs(b10))
  } else {
    emprise_proj <- emprise
  }
  
  # === Découpage
  b10_crop <- crop(b10, vect(emprise_proj))
  b10_mask <- mask(b10_crop, vect(emprise_proj))
  
  # === Calcul LST
  radiance <- ML * b10_mask + AL
  bt <- K2 / log((K1 / radiance) + 1)
  lambda <- 10.8
  c2 <- 14388
  emissivite <- 0.92
  lst <- bt / (1 + ((lambda * bt) / c2) * log(emissivite))
  lst_celsius <- lst - 273.15
  
  # === Nom de fichier de sortie
  output_file <- file.path(output_dir, paste0("LST_", annee, ".tif"))
  writeRaster(lst_celsius, output_file, filetype = "GTiff", overwrite = TRUE)
  
  # === Extraire la date d’acquisition (ex: 20130730)
  nom_b10 <- basename(b10_file)
  date_str <- str_sub(nom_b10, start = 18, end = 25)
  date_fmt <- as.Date(date_str, format = "%Y%m%d")
  dates_acquisition <- c(dates_acquisition, format(date_fmt, "%Y-%m-%d"))
  
  cat("✅ LST enregistrée pour", annee, "→", output_file, "\n")
}

# === Enregistrer les dates d’acquisition
dates_file <- file.path(output_dir, "dates_acquisition.txt")
writeLines(dates_acquisition, con = dates_file)
cat("📄 Fichier de dates créé :", dates_file, "\n")
