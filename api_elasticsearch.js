const client = require('./client');
const express = require("express");

const app = express()
app.use(express.json())
app.set('port', 4040)
console.log('Server listening on port', app.get('port'))
app.listen(app.get('port'))

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


var nom_index = "sites_archeo";

// INFO IMPORTANTE
// Pour importer le fichier france2.csv dans kibana, il faut aller sur http://localhost:5601/app/ml/filedatavisualizer (Machine Learning / File Upload)




app.get('/', function (req, res) {
    res.send('Hello world !')
})

// ***************************************

// affiche tous les sites archéologiques

app.get('/all', async function (req, res) {
// console.log("toto");
    async function Search() {

        const result = await client.search({
            index: nom_index,
            //Limit le nombre d'élément dans le resultat
            size: 15,
            query: {
                match_all: {}
            }
        })
        // retourne le résultat
        return result.hits.hits;
    }

    // Appel et récupère le résultat de la fonction Search
    var SearchResult = await Search()
    // Envoie le résultat de la recherche
    res.send(SearchResult)

})

// ***************************************

// Affiche un site par son id

app.get('/site/:id', async function (req, res) {
    var IdValue = req.params.id

    async function Search() {

        const result = await client.search({
            index: nom_index,
            query: {
                match: {
                    id: "" + IdValue + ""
                }
            }
        })
        // retourne le résultat
        return result.hits.hits;
    }

    // Appel et récupère le résultat de la fonction Search
    var SearchResult = await Search()
    // Envoie le résultat de la recherche
    res.send(SearchResult)
})


// ***************************************


// Recherche si id existe
// Si id n'existe pas return false

async function Search(idparam) {
    const result = await client.search({
        index: nom_index,
        query: {
            bool: {
                must: [
                    {
                        match: {
                            id:idparam
                        }
                    }
                ]
            }
        }
    })
    console.log(result)
    // Si l'id recherché existe alors le result sera à 1
    if (result.hits.total.value === 1) {
        return true
    } else {
        return false
    }
}

// ***************************************


// Ajout d'un site
app.post('/add', async function (req, res) {

    // Récuprération des datas
    var IdValue = req.body.id
    var Date_finValue = req.body.Date_fin
    var Nom_du_siteValue = req.body.Nom_du_site
    var Type_interventionValue = req.body.Type_intervention
    var ThemesValue = req.body.Themes
    var Date_debutValue = req.body.Date_debut
    var PeriodesValue = req.body.Periodes
    var DepartementValue = req.body.Departement
    var RegionValue = req.body.Region
    var CommuneValue = req.body.Commune
    var Lambert_YValue = req.body.Lambert_Y
    var Lambert_XValue = req.body.Lambert_X

    try {

        // Appel de la fonction Search
        var Matches = await Search(IdValue)

        // Si id existe, Matches égal true
        if (Matches !== true) {
            await client.index({
                index: nom_index,

                body: {
                    Date_fin: Date_finValue,
                    Nom_du_site: Nom_du_siteValue,
                    Type_intervention: Type_interventionValue,
                    Themes: ThemesValue,
                    Date_debut: Date_debutValue,
                    Periodes: PeriodesValue,
                    Departement: DepartementValue,
                    Region: RegionValue,
                    id: IdValue,
                    Commune: CommuneValue,
                    Lambert_Y: Lambert_YValue,
                    Lambert_X: Lambert_XValue
                }
            })
            await client.indices.refresh({index: nom_index})
            res.send('Ajout réussi')
        } else {
            res.send('Le site que vous souhaitez ajouter existe déjà !')
        }
    } catch (error) {
        res.send('Unable to add data. Check syntax.')
    }
})



// ***************************************

//Modification d'un site
app.post('/update/:id', async function (req, res) {

    // Récuprération des datas
    var IdValue = req.params.id
    var Date_finValue = req.body.Date_fin
    var Nom_du_siteValue = req.body.Nom_du_site
    var Type_interventionValue = req.body.Type_intervention
    var ThemesValue = req.body.Themes
    var Date_debutValue = req.body.Date_debut
    var PeriodesValue = req.body.Periodes
    var DepartementValue = req.body.Departement
    var RegionValue = req.body.Region
    const CommuneValue = req.body.Commune
    var Lambert_YValue = req.body.Lambert_Y
    var Lambert_XValue = req.body.Lambert_X

    try {

        // Appel de la fonction Search
        var Matches = await Search(IdValue)

        // Si id existe, Matches égal true
        if (Matches === true) {

            await client.updateByQuery({
                index: nom_index,

                script: {
                    source: "ctx._source.Date_fin = params.Date_fin; ctx._source.Nom_du_site = params.Nom_du_site; ctx._source.Type_intervention= params.Type_intervention; ctx._source.Themes= params.Themes; ctx._source.Date_debut= params.Date_debut; ctx._source.Periodes= params.Periodes; ctx._source.Departement= params.Departement; ctx._source.Region= params.Region; ctx._source.Commune= params.Commune; ctx._source.Lambert_Y= params.Lambert_Y; ctx._source.Lambert_X= params.Lambert_X;",
                    lang: "painless",
                    params: {
                        Date_fin: Date_finValue,
                        Nom_du_site: Nom_du_siteValue,
                        Type_intervention: Type_interventionValue,
                        Themes: ThemesValue,
                        Date_debut: Date_debutValue,
                        Periodes: PeriodesValue,
                        Departement: DepartementValue,
                        Region: RegionValue,
                        Commune: CommuneValue,
                        Lambert_Y: Lambert_YValue,
                        Lambert_X: Lambert_XValue
                    }
                },
                query: {
                    match: {
                        id: "" + IdValue + ""
                    }
                }

            }).then(
                function (resp) {
                    console.log("Modification réussie ! The response was: ", resp);
                },
                function (err) {
                    console.trace(err.message);
                }
            );

            await client.indices.refresh({index: nom_index})
            res.send('Modification réussie')
        } else {
            res.send('Le site que vous chercher n\'existe pas !')
        }
    } catch (error) {
        res.send('Unable to add data. Check syntax.')
    }
})


app.post('/delete/:id', async function (req, res) {

    // Récuprération de l'id
    var IdValue = req.params.id

    try {

        // Appel de la fonction Search
        var Matches = await Search(IdValue)

        // Si id existe, Matches égal true
        if (Matches === true) {
            await client.deleteByQuery({
                index: nom_index,
                body: {
                    query: {
                        match: {id: IdValue}
                    }
                }
            })
            await client.indices.refresh({index: nom_index})
            res.send('Le site a bien été supprimé !')
        } else {
            res.send("Le site que vous chercher n\'existe pas !")
        }
    } catch (error) {
        res.send('Unable to delete data. Check syntax.')
    }
})