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
    <li><b> 45 % des théâtres </li>
    <li> 66 % des personnes accueillies </li>
  </ul>
</ul>
→ Concentration des théâtres en Intra-muros</b>



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



### 3.1 ☀️ Ombrage

J'utilise l'algorithme GRASS r.sunmask.datetime et le LiDAR pour calculer les ombres portées du 10 juillet de 6h à 19h pour les deux sites d'étude.

<table width="100%">
  <tr>
    <td align="center" width="50%">
      <img src="https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/blob/f9728db546c68b86a8267d9c4e969b61c335f26a/03.1_ombrage/GIF_CHARTREUSE.gif?raw=true" width="90%"/>
    </td>
    <td align="center" width="50%">
      <img src="https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/blob/f9728db546c68b86a8267d9c4e969b61c335f26a/03.1_ombrage/GIF_MISTRAL.gif?raw=true" width="90%"/>
    </td>
  </tr>
</table>


→ Gymnase du lycée Mistral : 8h → 16h <br>
→ Chartreuse de Villeneuve lez Avignon : 11h → 15h (plus arbres ombragés toute la journée)<br>


---

## 4. 🍃 NDVI

Le **Normalized Difference Vegetation Index (NDVI)** a été utilisé pour identifier les zones végétalisées.

<ul>
  <li>Calcul du NDVI sur une zone de 200 mètres autour des théâtres.</li>  
</ul> <br>


<div align="center">
  <img src="https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/blob/ba8e0d75f181f22e1d201d003002c287d93fb85e/03.2_vegetation/NDVI_MOYEN.jpg?raw=true" width="70%"/>
</div> <br> <br>

🚨 <i>Spoiler alert</i> : La présence de végétation réduit la température. 🚨 <br>

<ul>
  <li>Régression linéaire et corrélation du NDVI et de la thermographie de surface :</li>  
</ul> <br>

<div align="center">
  <img src="https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/blob/ba8e0d75f181f22e1d201d003002c287d93fb85e/03.2_vegetation/correlation_ndvi_t.jpg?raw=true" width="70%"/>
</div> <br>

<ul>
  <li>42 % de la variance de la température est expliquée par le degré de végétalisation.</li>
  <li>Quand le NDVI augmente de 0.1, la température diminue de 1°C.
</li>
</ul> <br>


---

## 5. 🌡️ Température de surface

### 5.1 Télédétection

Quels facteurs explicatifs à l'apparition d'îlot de chaleur urbain (ICU) ? <br>

<table>
  <thead>
    <tr>
      <th>Catégorie</th>
      <th>Facteurs principaux</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Structure urbaine</td>
      <td>
        <ul>
          <li>Matériaux minéraux (bitume, béton)</li>
          <li>Faible albédo</li>
          <li>Morphologie des rues (canyon urbain)</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Absence de végétation</td>
      <td>
        <ul>
          <li>Sols imperméables</li>
          <li>Peu d'espaces verts</li>
          <li>Évapotranspiration réduite</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Activités humaines</td>
      <td>
        <ul>
          <li>Trafic routier et industries</li>
          <li>Chauffage et climatisation</li>
          <li>Pollution atmosphérique</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Facteurs climatiques</td>
      <td>
        <ul>
          <li>Vents faibles</li>
          <li>Faible humidité</li>
          <li>Ciel dégagé la nuit</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Facteurs temporels</td>
      <td>
        <ul>
          <li>Cycle jour/nuit</li>
          <li>Croissance urbaine rapide</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

<br> <br>


La température de surface a été extraite à partir des images **Landsat 8 & 9**.

- Images sélectionnées en juillet (période du Festival)

<br>
<div align="center">
  <img src="https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/blob/2e115b132a13b32595eb529df5fb6e6f749c7a1d/03.3_thermographie_mesuree/lst.jpg?raw=true" width="70%"/>
</div> <br>


En calculant des thermographies de surface en série temporelle, j'obtiens pour chaque théâtre du IN, l'évolution de la température entre 2013 et 2025. 

[![Ouvrir le PDF](https://img.shields.io/badge/Ouvrir%20le%20PDF-Graphique%20Théâtres%202025-blue?style=for-the-badge)](https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/blob/a29c43e40468eb44383f22aab254262bff794f1c/03.3_thermographie_mesuree/graphique_theatres_2025.pdf?raw=true)
<br>
→ Permet de détecter les théâtres les plus chauds et les plus frais :

<img width="2000" height="477" alt="image" src="https://github.com/user-attachments/assets/30ce9e33-6e74-4a87-beab-0255eb0731fd" />


### 5.2 Modélisation

En complément, une **modélisation thermique** a été réalisée à l’aide d’un modèle énergétique urbain.

Données d'entrée :
1. Occupation du sol
2. Fichier météo
3. Arbres (+ hauteur)
4. Bâtiments (+ hauteur)
5. Ombres portées

Avantages :
- Faible résolution spatiale
- Modélisation heure par heure
- Tester différentes configurations spatiales (notamment avant/après aménagement)


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

