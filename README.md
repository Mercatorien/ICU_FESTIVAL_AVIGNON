# Étude de la chaleur urbaine pendant le Festival IN d'Avignon <br> Objectif : Trouver les théâtres de demain

Ce projet a été réalisé dans le cadre d’un **stage de recherche** au sein de [**InterMEDIUS**](https://intermedius.univ-avignon.fr/), École Universitaire de Recherche soutenue par **Avignon Université**, en collaboration avec le laboratoire [**UMR 7300 ESPACE**](https://espace.cnrs.fr/).

L’objectif principal est de **comprendre la dynamique de la chaleur urbaine** lors du **Festival d’Avignon IN**, et d’identifier les **"lieux de demain"**, c’est-à-dire les futurs espaces potentiels pour accueillir des représentations théâtrales en tenant compte des contraintes climatiques (température, ombrage, végétation, accessibilité…).

Ce dépôt regroupe les analyses statistiques, modélisations, cartes, données et scripts utilisés dans le cadre de cette recherche.

Travail réalisé sous la direction de Sophie Gaillard et Didier Josselin.

## 📄 Licence

Ce projet est distribué sous licence [![Licence: CC BY-SA 4.0](https://img.shields.io/badge/Licence-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

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

## 3. Analyse multicritères

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



### 3.1 ☀️ Ombrage

J'utilise l'algorithme GRASS r.sunmask.datetime et le LiDAR pour calculer les ombres portées du 10 juillet de 6h à 19h pour les deux sites d'étude.

<br>
<div align="center">
  <img src="https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/blob/1f6863f2cc27448ba5ca49db5d0af3b538477540/03.1_ombrage/GIFS_OMBRAGE_COMBINE.gif?raw=true" width="100%"/>
</div> <br>



→ Gymnase du lycée Mistral : 8h → 16h <br>
→ Chartreuse de Villeneuve lez Avignon : 11h → 15h (plus arbres ombragés toute la journée)<br>


---

## 3.2 🍃 NDVI

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


## 3.3 Thermographie de surface mesurée par télédétection

Quels facteurs explicatifs à l'apparition d'îlot de chaleur urbain (ICU) ? <br>

<div align="center">

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
</div>

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


## 3.4 Température de surface modélisée

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


<br>
<div align="center">
  <img src="https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/blob/eff55d04554e156d4df50c1f424dfc294d024a2e/03.4_thermographie_modelisee/GIFS_ICE_TOOL_COMBINE.gif?raw=true" width="100%"/>
</div> <br>


<ins>Que retenir ?</ins>

1. Les températures changent plus ce que l’on pense selon :
	- L’heure
	- La typologie/morphologie urbaine
2. Écarts de température importants selon les lieux
	- 10 °C à 15h entre les deux théâtres (!)
3. La température la plus basse pour mistral, c’est quasiment la température la plus chaude pour le lycée mistral


---

## 4. 🏠 Étude du Diagnostic de Performance Énergétique (DPE)

Une des hypothèses de recherche est que les théâtres les moins isolés ont un confort thermique réduit. Pour mesurer ça, nous étudions le lien statistique entre la classe de **diagnostic de performance énergétique** et l'année de construction des bâtiments. Si le lien est avéré, nous pouvons extrapôler, et prédire par modélisation statistique la classe DPE pour les théâtres qui ne sont pas encore diagnostiqués.

<br>
<div align="center">
  <img src="https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/blob/57b4fd8c76cfd407175e1bf4b6696fde93c6e12b/04_dpe/boxplot_dpe.png?raw=true" width="70%"/>
</div> <br>


<div align="center">
  <a href="https://mercatorien.github.io/DPE_FESTIVAL_AVIGNON/" target="_blank">
    <img src="https://img.shields.io/badge/🔎%20Voir%20l'analyse%20statistique%20du%20DPE%20en%20ligne-blue?style=for-the-badge" alt="DPE Festival Avignon"/>
  </a>
</div> <br>

Les conditions de réalisation de l'ANOVA ne sont pas réunies :
Normalité (Shapiro-Wilk) : Les distributions par classe ne respectent pas la normalité (p-values très faibles, < 0.001).

Homogénéité des variances (Levene) : Les variances sont significativement différentes entre classes (p-value < 0.001).

En réalisant le test non paramétrique de Kruskal-Wallis qui permet de comparer les médianes de plusieurs groupes sans supposer la normalité des données, nous obtenons une p-value significative (< 0.001) qui indique qu'il existe au moins une différence significative entre les groupes.

---

## 5. 🏛️ Les lieux d’hier les plus susceptibles d’être réutilisables

À partir de la base de donnée créée par Kevin Bernard qui recense tous les théâtres du IN depuis 1947 jusqu'à nos jours, je calcule l'évolution de la température sur les 162 théâtres les plus proches d'Avignon.

[![Ouvrir le PDF](https://img.shields.io/badge/Ouvrir%20le%20PDF-Graphique%20Théâtres%202025-blue?style=for-the-badge)](https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/blob/6d60b07fe1fb728297283e2d235178cf6a176638/05_lieux_dhier/graphique_theatres_avant_LST.pdf?raw=true) <br>

La heatmap suivante montre l'écart de température à la moyenne anuelle des 10 % des théâtres les plus chauds et les plus frais.

<br>
<div align="center">
  <img src="https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/blob/6d60b07fe1fb728297283e2d235178cf6a176638/05_lieux_dhier/heatmap_theatres_frais_chauds.png?raw=true" width="100%"/>
</div> <br>

Le même graphique mais pour tous les théâtres existe dans ce dossier : 
📂[`03.6_lieux_dhier`](https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/tree/main/05_lieux_dhier)


---

## Présentation du projet : <br>

<div align="center">
  <a href="https://github.com/Mercatorien/ICU_FESTIVAL_AVIGNON/blob/98ba23ab772e0a877fa6d5bff3f048c1d1b0d6e5/PRESENTATION_MASSOT.pdf?raw=true" target="_blank">
    <img src="https://img.shields.io/badge/📄 Présentation%20du%20projet%20(PDF)-blue?style=for-the-badge" alt="PDF Présentation">
  </a>
</div> <br>


---

## 📁 Arborescence du dépôt

ICU_FESTIVAL_AVIGNON/<br>
├── 01_bdd/                        # Base de données utilisée pour l’analyse<br>
│   └── BDD.png<br>
├── 02_accessibilite/             # Analyse de l'accessibilité des lieux<br>
│   └── ACCESSIBILITE.png<br>
├── 03.1_ombrage/                 # Étude de l’ombrage (GIFs)<br>
│   ├── GIF_MISTRAL.gif<br>
│   └── GIF_CHARTREUSE.gif<br>
├── 03.2_ndvi/                    # Indice de végétation NDVI<br>
│   └── NDVI.png<br>
├── 03.3_thermographie_mesuree/   # Température de surface mesurée<br>
│   └── graphique_theatres_2025.pdf<br>
├── 03.4_thermographie_modelee/   # Température de surface modélisée<br>
│   └── modelee_temp.png<br>
├── 03.5_dpe/                     # Analyse du DPE des bâtiments<br>
│   └── lien vers le site : https://mercatorien.github.io/DPE_FESTIVAL_AVIGNON/<br>
├── 03.6_lieux_dhier/             # Étude sur la réutilisation des lieux historiques<br>
│   └── fichiers d'analyse<br>
├── PRESENTATION_MASSOT.pdf       # Présentation complète du projet<br>
└── README.md                     # Présentation générale du dépôt<br><br>


