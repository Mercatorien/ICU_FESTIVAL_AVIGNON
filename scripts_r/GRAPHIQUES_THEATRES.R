library(sf)
library(dplyr)
library(tidyr)
library(ggplot2)
library(patchwork)
library(readr)
library(purrr) 
library(grid)  
library(forcats)

# === Charger les données ===
gpkg_path <- ".gpkg"
theatres <- st_read(gpkg_path)

# === Mettre au format long ===
theatres_long <- theatres %>%
  st_drop_geometry() %>%
  pivot_longer(
    cols = starts_with("LST_"),
    names_to = "Annee",
    names_prefix = "LST_",
    values_to = "Temp"
  ) %>%
  mutate(Annee = as.integer(Annee))

# === Moyenne globale ===
temp_moyenne_globale <- theatres_long %>%
  filter(!is.na(Temp)) %>%
  group_by(Annee) %>%
  summarise(Temp_moy = mean(Temp, na.rm = TRUE))

theatres_long <- theatres_long %>%
  left_join(temp_moyenne_globale, by = "Annee")

# === Moyenne par théâtre ===
moyennes_theatre <- theatres_long %>%
  group_by(Nom) %>%
  summarise(Temp_mean = mean(Temp, na.rm = TRUE))

# === Ordre des théâtres ===
theatres_long <- theatres_long %>%
  left_join(moyennes_theatre, by = "Nom") %>%
  mutate(Nom = factor(Nom, levels = moyennes_theatre %>% arrange(desc(Temp_mean)) %>% pull(Nom)))

# === Années paires ===
annees_pairs <- unique(theatres_long$Annee[theatres_long$Annee %% 2 == 0])

# === Calculer le min et le max global ===
temp_min <- min(theatres_long$Temp, na.rm = TRUE)
temp_max <- max(theatres_long$Temp, na.rm = TRUE)

# === Créer les graphiques (seulement avec données) ===
plots <- theatres_long %>%
  group_by(Nom) %>%
  group_split() %>%
  keep(~ any(!is.na(.x$Temp))) %>%
  lapply(function(df) {
    temp_moy_theatre <- round(df$Temp_mean[1], 1)
    
    ggplot(df, aes(x = Annee, y = Temp)) +
      geom_line(color = "#0072B2", size = 1.2) +
      geom_point(color = "#D55E00", size = 2) +
      geom_line(aes(y = Temp_moy), color = "lightgray", linetype = "dashed", size = 0.8) +
      scale_x_continuous(breaks = annees_pairs) +
      coord_cartesian(ylim = c(temp_min, temp_max)) +   
      labs(
        title = paste0(df$Nom[1], "\nT°C μ = ", temp_moy_theatre, "°C"),
        x = NULL, y = NULL
      ) +
      theme_minimal(base_size = 12) +
      theme(
        plot.title = element_text(face = "bold", size = 10, hjust = 0.5),
        axis.text = element_text(size = 8)
      )
  })


# === Regrouper plots ===
plots_per_page <- 12  # 3 colonnes * 4 rangées
plot_groups <- split(plots, ceiling(seq_along(plots) / plots_per_page))

# === Export PDF ===
pdf(".pdf",
    width = 14, height = 10)

# ---- Page de titre ----
grid.newpage()
grid.text(
  "Température des théâtres utilisés dans le Festival IN entre 1974 et 2024",
  x = 0.5, y = 0.5,
  gp = gpar(fontsize = 24, fontface = "bold")
)

# ---- Pages de graphiques ----
for (pg in plot_groups) {
  p <- wrap_plots(pg, ncol = 3, nrow = 4)
  print(p)
}

dev.off()
cat("✅ PDF des graphiques créé avec succès.\n")




# ---- GRAPHIQUE N°2 ---- #
# === LIBRAIRIES ===
library(plotly)
library(RColorBrewer)
library(htmlwidgets)

# === Données ===
df_all <- theatres_long %>%
  filter(!is.na(Temp))

# === Génère une palette aléatoire ===
n_theatres <- length(unique(df_all$Nom))
palette_colors <- sample(colors(), n_theatres) 

# === Graphique global ===
gg_all <- ggplot(df_all, aes(x = Annee, y = Temp, color = Nom)) +
  geom_line(size = 0.6) +
  geom_point(size = 1.2) +
  scale_color_manual(values = palette_colors) +
  labs(
    title = "Température des théâtres du \"passé\"",
    x = "Année",
    y = "Température (°C)",
    color = "Théâtre"
  ) +
  theme_minimal(base_size = 14) +
  theme(
    plot.title = element_text(face = "bold", size = 18, hjust = 0.5),
    legend.position = "right"
  )

# === Interactif ===
plotly_all <- ggplotly(gg_all)

# === Export HTML ===
htmlwidgets::saveWidget(
  plotly_all,
  file = ".html",
  selfcontained = TRUE
)

cat("✅ Graphique interactif sauvegardé en HTML.\n")








library(patchwork) 
library(dplyr)
library(ggplot2)

# ---- 1. Préparer les données ----
n_extreme <- ceiling(0.10 * nrow(moyennes_theatre))

heat_df_base <- theatres_long %>%
  mutate(Nom_abbr = substr(as.character(Nom), 1, 25)) %>%
  mutate(Ecart = Temp - Temp_moy)

# ---- Frais : trier par écart moyen (croissant) ----
df_frais <- heat_df_base %>%
  filter(Nom %in% (moyennes_theatre %>% arrange(Temp_mean) %>% slice_head(n = n_extreme))$Nom) %>%
  group_by(Nom_abbr) %>%
  mutate(Ecart_mean = mean(Ecart, na.rm = TRUE)) %>%
  ungroup()

df_frais_summary <- df_frais %>%
  group_by(Nom_abbr) %>%
  summarise(Ecart_mean = mean(Ecart_mean, na.rm = TRUE)) %>%
  arrange(Ecart_mean)

df_frais <- df_frais %>%
  mutate(
    Nom_abbr = factor(Nom_abbr, levels = df_frais_summary$Nom_abbr),
    Ecart_txt = round(Ecart, 1)
  )

# ---- Chauds : trier par écart moyen (décroissant) ----
df_chaud <- heat_df_base %>%
  filter(Nom %in% (moyennes_theatre %>% arrange(desc(Temp_mean)) %>% slice_head(n = n_extreme))$Nom) %>%
  group_by(Nom_abbr) %>%
  mutate(Ecart_mean = mean(Ecart, na.rm = TRUE)) %>%
  ungroup()

df_chaud_summary <- df_chaud %>%
  group_by(Nom_abbr) %>%
  summarise(Ecart_mean = mean(Ecart_mean, na.rm = TRUE)) %>%
  arrange(desc(Ecart_mean))

df_chaud <- df_chaud %>%
  mutate(
    Nom_abbr = factor(Nom_abbr, levels = df_chaud_summary$Nom_abbr),
    Ecart_txt = round(Ecart, 1)
  )

# Palette commune : min et max globaux
ecart_min <- min(heat_df_base$Ecart, na.rm = TRUE)
ecart_max <- max(heat_df_base$Ecart, na.rm = TRUE)

# ---- 2. Heatmap des plus frais ----
plot_frais <- ggplot(df_frais, aes(x = Annee, y = Nom_abbr, fill = Ecart)) +
  geom_tile(color = "grey70") +
  geom_text(aes(label = Ecart_txt), size = 3, color = "black") +
  scale_fill_gradient2(
    low = "blue", mid = "white", high = "red",
    midpoint = 0, limits = c(ecart_min, ecart_max), name = "Écart (°C)"
  ) +
  scale_x_continuous(breaks = annees_pairs) +
  labs(title = "Théâtres les plus frais", x = "", y = NULL) +
  theme_minimal(base_size = 12) +
  theme(
    plot.title  = element_text(face = "bold", hjust = 0.5),
    axis.text.x = element_text(angle = 45, hjust = 1)
  )

# ---- 3. Heatmap des plus chauds ----
plot_chaud <- ggplot(df_chaud, aes(x = Annee, y = Nom_abbr, fill = Ecart)) +
  geom_tile(color = "grey70") +
  geom_text(aes(label = Ecart_txt), size = 3, color = "black") +
  scale_fill_gradient2(
    low = "blue", mid = "white", high = "red",
    midpoint = 0, limits = c(ecart_min, ecart_max), name = "Écart (°C)"
  ) +
  scale_x_continuous(breaks = annees_pairs) +
  labs(title = "Théâtres les plus chauds", x = "", y = NULL) +
  theme_minimal(base_size = 12) +
  theme(
    plot.title  = element_text(face = "bold", hjust = 0.5),
    axis.text.x = element_text(angle = 45, hjust = 1),
    axis.text.y = element_text(size = 8)
  )

# ---- 4. Assembler les deux plots côte à côte ----
heatmaps_extremes <- plot_frais + plot_chaud +
  plot_layout(guides = "collect") +
  plot_annotation(
    title = "Écart à la température moyenne annuelle\npour les 10 % des anciens théâtres les plus frais et les plus chauds",
    theme = theme(
      plot.title = element_text(size = 16, face = "bold", hjust = 0.5)
    )
  ) &
  theme(legend.position = "right")

# ---- 5. Affichage et export ----
print(heatmaps_extremes)

ggsave(
  filename = ".png",
  plot     = heatmaps_extremes,
  width    = 14, height = 6, dpi = 300
)

cat("✅ Heatmaps frais / chauds générées avec succès.\n")

