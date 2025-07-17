# Étude de la chaleur urbaine pendant le Festival d'Avignon — Trouver les théâtres de demain

Ce projet a été réalisé dans le cadre d’un **stage de recherche** au sein de **InterMEDIUS**, École Universitaire de Recherche soutenue par **Avignon Université**, en collaboration avec le laboratoire **UMR 7300 ESPACE**.

L’objectif principal est de **comprendre la dynamique de la chaleur urbaine** à Avignon en période estivale, en particulier lors du **Festival d’Avignon IN**, et d’identifier les **"lieux de demain"**, c’est-à-dire les futurs espaces potentiels pour accueillir des représentations théâtrales en tenant compte des contraintes climatiques (température, ombrage, végétation, accessibilité…).

Ce dépôt regroupe les analyses, cartes, données et scripts utilisés dans le cadre de cette recherche.

> Licence : [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

---

## 1. 📊 Base de données

Le recensement des théâtres du IN pour l'édition 2025. Ca implique la création d'une base de données spatiale sur PgAdmin.

<div align="center">
  <img src="https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/blob/16ed9ac300171113d96bfb159e723d684199eb3a/01_bdd/BDD.png?raw=true" width="70%"/>
</div><br>



Les fichiers .Csv se situent dans le dossier [![Accéder au dossier 01_bdd](https://img.shields.io/badge/Dossier-01__bdd-blue)](https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/tree/main/01_bdd). <br>


---

## 2. 🚶 Accessibilité

L’accessibilité des lieux est un facteur clé pour l’accueil du public. En calculant les isochrone, je spatialise pour tous point de l'espace le nombre de théâtres accessibles en 15 minutes à pied.

<div align="center">
  <img src="https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/blob/ab0a09dea09083b8ec388134e4ccca94c98eba34/02_accessibilite/ACCESSIBILITE.png?raw=true" width="70%"/>
</div> <br>



Résultat : 
<ul>
  <li>À moins de 15 minutes à pied de la place Pie :</li>
  <ul>
    <li>45 % des théâtres</li>
    <li>66 % des personnes accueillies</li>
  </ul>
  <li>→ Concentration des théâtres en Intra-muros</li>
</ul>


---

## 3. Analyse multi-critères

Dans cette analyse multicritères, on travaille sur :
<ul>
<li> L'ombrage</li>
<li> La végétalisation</li>
<li> La Température de surface mesurée par télédétection</li>
<li> Température de surface modélisée</li>
</ul> <br>

Choix de deux sites d'étude pour appliquer la méthode : <br>

<div align="center">
  <img src="https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/blob/403c1899766cedc2a9d14d9ae8ad353a75bbf4cb/03_multicritere/sites_etude.jpg?raw=true" width="70%"/>
</div> <br><br>

<div align="center">
  <img src="https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/blob/ee8c88880a21f63aa8e3866ca63131cb965a88d1/03_multicritere/typologies_sites.png?raw=true" width="40%"/>
</div> <br>



### 3.1 🌳 Ombrage



Gymnase du lycée Mistral : 8h → 15h
Chartreuse de Villeneuve lez Avignon : 11h → 15h (plus arbres ombragés toute la journée)


---

## 4. 🍃 NDVI

Le **Normalized Difference Vegetation Index (NDVI)** a été utilisé pour identifier les zones végétalisées.

- Calculé à partir des images Sentinel-2
- Corrélé à la température de surface
- Permet d’identifier les **îlots de fraîcheur végétale**

Les zones à fort NDVI sont valorisées pour leur potentiel de régulation thermique.

---

## 5. 🌡️ Température de surface

### 5.1 Télédétection

La température de surface a été extraite à partir des images **Landsat 8**.

- Images sélectionnées en période de canicule (juillet)
- Extraction de la température de brillance et correction atmosphérique
- Résultat : **carte thermique haute résolution** de la ville d’Avignon

### 5.2 Modélisation

En complément, une **modélisation thermique** a été réalisée à l’aide d’un modèle énergétique urbain simplifié.

- Intègre les matériaux urbains, les usages, la végétation
- Permet de prédire la température en fonction de différents scénarios (densification, verdissement)
- Utilisé pour **simuler l’impact thermique** de futures installations culturelles

---

## 6. 🏠 Étude du Diagnostic de Performance Énergétique (DPE)

L’analyse du **parc bâti** a été conduite via les diagnostics de performance énergétique :

- Extraction des données DPE via Etalab
- Croisement avec les données cadastrales
- Classification des bâtiments selon leur performance
- Identification des bâtiments potentiellement inconfortables en période estivale

Objectif : **éviter de programmer des représentations dans des lieux trop énergivores ou mal isolés.**

---

## 7. 🏛️ Les lieux d’hier les plus susceptibles d’être réutilisables

Un inventaire des lieux utilisés historiquement par le Festival a été croisé avec :

- Leur performance thermique actuelle
- Leur accessibilité
- Leur confort d’usage (ombrage, végétation, température)

Une **typologie des lieux réutilisables** a été établie pour guider les choix futurs des organisateurs, en conciliant **mémoire des lieux** et **enjeux climatiques contemporains**.

---

## 🔗 Liens utiles

- 🌐 [InterMEDIUS – EUR Avignon Université](https://intermedius.univ-avignon.fr/)
- 🛰️ [UMR 7300 ESPACE – CNRS](https://espace.cnrs.fr/)
- 📘 [Licence CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

---

## 📁 Arborescence simplifiée du dépôt

