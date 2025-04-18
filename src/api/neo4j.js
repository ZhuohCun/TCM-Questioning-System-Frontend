var neo4j = require("neo4j-driver");

const driver = neo4j.driver('neo4j+s://6a4e9a3a.databases.neo4j.io:7687', neo4j.auth.basic('neo4j', 'pxv2vsJaXU0BBtht710jXeHy7LLx7zAf2BZ7pgOuSG4'));

function executeCypher(query, callback) {
    const session = driver.session();
    session.run(query)
        .then(result => {
            session.close();
            callback(result.records);
        })
        .catch(error => {
            console.log("Cypher 执行失败！", error);
            session.close();
        });
}

module.exports = { executeCypher };
