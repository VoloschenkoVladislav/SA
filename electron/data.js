const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/data.db');

class Data {
    
    /*
    Проблема
    * Описание
    * Название
    * Список альтернатив
    * Статус
    * Id
    */
   
   static init() {
        db.run('CREATE TABLE IF NOT EXISTS problems (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, status BOOL);');
        db.run('CREATE TABLE IF NOT EXISTS alts (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT, problem INTEGER, FOREIGN KEY (problem) REFERENCES problems(id));');
        db.run('CREATE TABLE IF NOT EXISTS solutions (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, dimension INTEGER, elem_string TEXT, problem INTEGER, FOREIGN KEY (problem) REFERENCES problems(id));')
    }

    // возвращает Id's проблем
    static getAllProblems() {
        let ids = [];
        return new Promise((resolve, reject) => db.each(`SELECT * FROM problems;`, [], (err, row) => {
            ids.push(row.id);
        },
        () => {
            resolve(ids);
        }));
    }

    /*
        Возвращает объект типа
        {
            name: имя_проблемы,
            description: описание_проблемы,
            alts: [решение_1, решение_2, ...],
            solution: null/[размерность_матрицы, элемент1, элемент2, ...]
            status: true/false,
            id: id
        }
    */
    static getProblemById(id) {

        let problem;
        let alts = [];
        let solution = [];


        return new Promise((resolve, reject) => {
            db.each(`SELECT * FROM alts WHERE problem='${id}' ORDER BY id`, [], (err, row) => {
                alts.push(row.name);
            }, (err) => {
                db.get(`SELECT status FROM solutions WHERE problem='${id}'`, [], (err, row) => {
                    if (row.status == true) {
                        db.get(`SELECT dimension FROM solutions WHERE problem='${id}'`, [], (err, row) => {
                            solution.push(row.dimension);
                    
                            db.get(`SELECT elem_string FROM solutions WHERE problem='${id}'`, [], (err, row) => {
                                solution.concat(row.elem_string.split(''));
                    
                                db.get(`SELECT * FROM problems WHERE id='${id}';`, [], (err, row) => {
                                    problem = {
                                        name: row.name,
                                        description: row.description,
                                        alts: alts,
                                        solution: solution,
                                        status: true,
                                        id: id
                                    };  
                                    resolve(problem);  
                                });
                            });
                        });
                    }
                    else {
                        db.get(`SELECT * FROM problems WHERE id='${id}';`, [], (err, row) => {
                            problem = {
                                name: row.name,
                                description: row.description,
                                alts: alts,
                                solution: null,
                                status: false,
                                id: id
                            };
                            resolve(problem);  
                        });
                    }
                });
            });
        });
    }

    
    static getIdByName(name) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT id FROM problems WHERE name='${name}';`, [], (err, row) => {
                resolve(row.id);
            });
        });
    }

    static addNewProblem(name, description, alts) {
        db.run(`INSERT INTO problems (name, description, status) VALUES (?, ?, ?);`, [name, description, 0], (err, row) => {
            Data.getIdByName(name).then((id) => {
                for (let alt_name in alts) {
                    db.run(`INSERT INTO alts (name, problem) VALUES (?, ?);`, [alt_name, id]);
                }
            });
        });
    }

    static setSolutionToProblem(problem_id, solution) {
        let dim = solution[0];
        let string_solution = solution.slice(1, solution.length).join();

        db.run(`INSERT INTO solutions (dimension, elem_string, problem) VALUES (?, ?, ?)`, [dim, string_solution, problem_id]);
    }
}

exports.Data = Data;