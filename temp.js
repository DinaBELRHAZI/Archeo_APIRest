const esClient = require('./client');
const searchDoc = async function(indexName, payload){
      return await esClient.search({
         index: indexName,
         body: payload
       });
   }
module.exports = searchDoc;
async function test(){
/* DSL Query */
// var query =
// {
//     "query" : {
//         "match" : {
//         }
//     }
// };
/* DSL Query with filter */
// var query =
// {
//     "query" : {
//         "bool" : {
//             "must" : {
//                 "match" : {
//                     "bike_name" : "TVS Star City Plus Dual Tone 110cc"
//                 }
//             },
//             "filter" : {
//                 "range" : {
//                     "age" : { "gt" : 3 } //range filter: older than 3
//                 }
//             }
//         }
//     }
// };
/* Full-Text Search */
// var query ={
//     "query" : {
//         "match" : {
//             "owner" : "Second Owner"
//         }
//     }
// };
/* Phrase Search */
var query ={
"query" : {
"match_phrase" : {              //match exact "First Owner"
"owner" : "First Owner"
}
}
};
try {
  const resp = await searchDoc('used-bikes', query);
      console.log(resp);
   } catch (e) {
      console.log(e);
   }
}
test();