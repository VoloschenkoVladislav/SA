const {app, BrowserWindow} = require('electron')
const path = require ('path');
const url = require ('url');
const { ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.resolve(__dirname, 'data.db')
const db = new sqlite3.Database(dbPath);

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
    db.run('CREATE TABLE IF NOT EXISTS problems (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, status BOOL, scale INTEGER);');
    db.run('CREATE TABLE IF NOT EXISTS scales (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, value INTEGER, problem INTEGER, FOREIGN KEY (problem) REFERENCES problems(id))')
    db.run('CREATE TABLE IF NOT EXISTS alts (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT, problem INTEGER, FOREIGN KEY (problem) REFERENCES problems(id));');
    db.run('CREATE TABLE IF NOT EXISTS competence (value FLOAT, problem INTEGER, expert INTEGER, FOREIGN KEY (problem) REFERENCES problems(id), FOREIGN KEY (expert) REFERENCES experts(id))')
    db.run('CREATE TABLE IF NOT EXISTS experts (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, login TEXT)')
    db.run('CREATE TABLE IF NOT EXISTS solutions_pair (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, elem_string TEXT, problem INTEGER, expert INTEGER, FOREIGN KEY (problem) REFERENCES problems(id), FOREIGN KEY (expert) REFERENCES experts(id));');
    db.run('CREATE TABLE IF NOT EXISTS solutions_percent (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, elem_string TEXT, problem INTEGER, expert INTEGER, FOREIGN KEY (problem) REFERENCES problems(id), FOREIGN KEY (expert) REFERENCES experts(id))');
    db.run('CREATE TABLE IF NOT EXISTS solutions_rank (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, elem_string TEXT, problem INTEGER, expert INTEGER, FOREIGN KEY (problem) REFERENCES problems(id), FOREIGN KEY (expert) REFERENCES experts(id))');
    db.run('CREATE TABLE IF NOT EXISTS solutions_preference (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, elem_string TEXT, problem INTEGER, expert INTEGER, FOREIGN KEY (problem) REFERENCES problems(id), FOREIGN KEY (expert) REFERENCES experts(id))');
    db.run('CREATE TABLE IF NOT EXISTS solutions_full_pair (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, elem_string TEXT, problem INTEGER, expert INTEGER, FOREIGN KEY (problem) REFERENCES problems(id), FOREIGN KEY (expert) REFERENCES experts(id))');
    db.run('CREATE TABLE IF NOT EXISTS unsaved_expert_solutions (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, pair TEXT, percent TEXT, rank TEXT, preference TEXT, full_pair TEXT, expert INTEGER, problem INTEGER, FOREIGN KEY (expert) REFERENCES experts(id), FOREIGN KEY (problem) REFERENCES problems(id));')
  }
}







Data.init();

ipcMain.on('set-competence', (event, arg) => {
    let expert = arg.expert;
    let problem = arg.problem;
    let competence = arg.competence;

    console.log(`set: ${[expert, problem, competence]}`);

    db.run(`INSERT INTO competence (expert, problem, value) VALUES (${expert}, ${problem}, ${competence});`, [], (err, row) => {
        db.run(`INSERT INTO unsaved_expert_solutions (pair, percent, rank, preference, full_pair, expert, problem) VALUES ('', '', '', '', '', ${expert}, ${problem});`, [], (err, row) => {
            event.returnValue = true
        });
    });
});

ipcMain.on('remove-competence', (event, arg) => {
    let expert = arg.expert;
    let problem = arg.problem;

    console.log([expert, problem]);

    db.run(`DELETE FROM competence WHERE expert=${expert} AND problem=${problem};`, [], (err, row) => {
        db.run(`DELETE FROM unsaved_expert_solutions WHERE expert=${expert} AND problem=${problem};`, [], (err, row) => {
            event.returnValue = true
        });
    });
});

ipcMain.on('get-competence', (event, arg) => {
    let expert = arg.expert;
    let problem = arg.problem;

    db.get(`SELECT * FROM competence WHERE expert=${expert} AND problem=${problem};`, [], (err, row) => {
        if (row === undefined) event.returnValue = false;
        else event.returnValue = row.value;
        console.log(`comp: ${JSON.stringify(row)}`)
    })
});

ipcMain.on('get-unfinished-solution', (event, arg) => {
    let method = arg.method;
    let expert = arg.expert;
    let problem = arg.problem;

    console.log(`get-solution: ${[arg.expert, arg.problem]}`);

    switch(method) {
        case "pair":
            db.get(`SELECT * FROM unsaved_expert_solutions WHERE expert=${expert} AND problem=${problem};`, [], (err, row) => {
                if (row.pair != '') event.returnValue = row.pair.split(';');
                else event.returnValue = []
            });
            break;
        case "percent":
            db.get(`SELECT * FROM unsaved_expert_solutions WHERE expert=${expert} AND problem=${problem};`, [], (err, row) => {
                if (row.percent != '') event.returnValue = row.percent.split(';');
                else event.returnValue = []
            });
            break;
        case "fullpair":
            db.get(`SELECT * FROM unsaved_expert_solutions WHERE expert=${expert} AND problem=${problem};`, [], (err, row) => {
                if (row.full_pair != '') event.returnValue = row.full_pair.split(';');
                else event.returnValue = []
            });
            break;
        case "preference":
            db.get(`SELECT * FROM unsaved_expert_solutions WHERE expert=${expert} AND problem=${problem};`, [], (err, row) => {
                if (row.preference != '') event.returnValue = row.preference.split(';');
                else event.returnValue = []
            });
            break;
        case "rank":
            db.get(`SELECT * FROM unsaved_expert_solutions WHERE expert=${expert} AND problem=${problem};`, [], (err, row) => {
                if (row.rank != '') event.returnValue = row.rank.split(';');
                else event.returnValue = []
            });
            break;
    }
});

ipcMain.on('save-unfinished-solution', (event, arg) => {
    let method = arg.method;
    let expert = arg.expert;
    let problem = arg.problem;
    let solution = arg.solution;
    switch(method) {
        case "pair":
            db.run(`UPDATE unsaved_expert_solutions SET pair='${solution}' WHERE expert=${expert} AND problem=${problem};`);
            break;
        case "percent":
            db.run(`UPDATE unsaved_expert_solutions SET percent='${solution}' WHERE expert=${expert} AND problem=${problem};`);
            break;
        case "fullpair":
            db.run(`UPDATE unsaved_expert_solutions SET full_pair='${solution}' WHERE expert=${expert} AND problem=${problem};`);
            break;
        case "preference":
            db.run(`UPDATE unsaved_expert_solutions SET preference='${solution}' WHERE expert=${expert} AND problem=${problem};`);
            break;
        case "rank":
            db.run(`UPDATE unsaved_expert_solutions SET rank='${solution}' WHERE expert=${expert} AND problem=${problem};`);
            break;
    }
});

ipcMain.on('add-new-problem', (event, arg) => {
    let
        name = arg.name,
        description = arg.description,
        alts = arg.alts;
        scale = Number(arg.scale);


    db.run(`INSERT INTO problems (name, description, status) VALUES (?, ?, ?);`, [name, description, false], () => {
        db.get(`SELECT * FROM problems WHERE name='${name}';`, [], (err, row) => {
            for (let alt_name in alts) {
                db.run(`INSERT INTO alts (name, problem) VALUES (?, ?);`, [alts[alt_name], row.id]);
            }
            db.run(`INSERT INTO scales (problem, value) VALUES (${row.id}, ${scale});`)
        });
    });
});

ipcMain.on('get-allowed-method-by-expert-and-problem', (event, arg) => {
    let out = [];
    db.get(`SELECT * FROM solutions_pair WHERE expert='${arg.expert}' AND problem='${arg.problem}';`, [], (err, row) => {
        if (row === undefined) out.push('pair');
        db.get(`SELECT * FROM solutions_percent WHERE expert=${arg.expert} AND problem=${arg.problem};`, [], (err, row) => {
            if (row === undefined) out.push('percent');
            db.get(`SELECT * FROM solutions_rank WHERE expert=${arg.expert} AND problem=${arg.problem};`, [], (err, row) => {
                if (row === undefined) out.push('rank');
                db.get(`SELECT * FROM solutions_preference WHERE expert=${arg.expert} AND problem=${arg.problem};`, [], (err, row) => {
                    if (row === undefined) out.push('preference');
                    db.get(`SELECT * FROM solutions_full_pair WHERE expert=${arg.expert} AND problem=${arg.problem};`, [], (err, row) => {
                        if (row === undefined) out.push('fullpair');
                        event.returnValue = out;
                    });
                });
            });
        });
    });
});

ipcMain.on('delete-solution', (event, arg) => {
    let expert = arg.expert;
    let problem = arg.problem;
    let method = arg.method;

    switch (method) {
        case 'pair':
            db.run(`DELETE FROM solutions_pair WHERE expert=${expert} AND problem=${problem};`, [], () => {event.returnValue = true});
            break;
        case 'rank':
            db.run(`DELETE FROM solutions_rank WHERE expert=${expert} AND problem=${problem};`, [], () => {event.returnValue = true});
            break;
        case 'preference':
            db.run(`DELETE FROM solutions_preference WHERE expert=${expert} AND problem=${problem};`, [], () => {event.returnValue = true});
            break;
        case 'fullpair':
            db.run(`DELETE FROM solutions_full_pair WHERE expert=${expert} AND problem=${problem};`, [], () => {event.returnValue = true});
            break;
        case 'percent':
            db.run(`DELETE FROM solutions_percent WHERE expert=${expert} AND problem=${problem};`, [], () => {event.returnValue = true});
            break;
    }
})

ipcMain.on('get-problems-by-expert', (event, arg) => {
    let actual_problems = [];

    db.each(`SELECT * FROM competence WHERE expert=${arg};`, [], (err, row) => {
        let problem = row.problem;
        let competence = row.value;
        
        db.get(`SELECT * FROM problems WHERE id=${row.problem};`, [], (err, row) => {
            if (row.status) actual_problems.push({id: problem, competence: competence});
            console.log(`row.status: ${row.status}`);
        });
    }, () => {
        setTimeout(() => {event.returnValue = actual_problems}, 30);
        console.log(`act_prob: ${actual_problems}`);
    });
});

ipcMain.on('change-expert', (event, arg) => {
    db.run(`UPDATE experts SET login='${arg.login}' WHERE id=${arg.id};`, [], () => {
        event.returnValue = true;
    });
});

ipcMain.on('delete-expert', (event, arg) => {
    db.run(`DELETE FROM experts WHERE id=${arg};`, [], () => {
        db.run(`DELETE FROM competence WHERE expert=${arg};`, [], () => {
            db.run(`DELETE FROM unsaved_expert_solutions WHERE expert=${arg}`, [], () => {
                event.returnValue = true
            });
        });
    })
});

ipcMain.on('add-new-expert', (event, arg) => {
    let
        login = arg.login,
        problems = arg.problems;

    db.get(`SELECT * FROM experts WHERE login='${login}';`, [], (err, row) => {
        if (row) {
            event.returnValue = false;
        }
        db.run(`INSERT INTO experts (login) VALUES (?);`, [login], (err, row) => {
            event.returnValue = true;
        });
    });
});

ipcMain.on('get-all-experts', event => {
    let ids = [];
    db.each(`SELECT * FROM experts;`, [], (err, row) => {
        ids.push(row.id);
    },
    () => {
        console.log(ids);
        event.returnValue = ids;
    });
});

ipcMain.on('get-expert-by-id', (event, arg) => {
    
    /*
      Возвращает объект типа
      {
          login: логин_эксперта,
          competence: [{problem: id_проблемы, competence: компетентность_эксперта}, ...]
          id: id
      }
    */

    let out = {};
    let competence = [];

    db.get(`SELECT * FROM experts WHERE id='${arg}';`, [], (err, row) => {
        if (!row) event.returnValue = false;
        else {
            out.login = row.login;
            db.each(`SELECT * FROM competence WHERE expert='${arg}';`, [], (err, row) => {
                competence.push({problem: row.problem, competence: row.value});
            }, () => {
                out.competence = competence;
                out.id = arg;
                event.returnValue = out;
            })
        }
    });
});

ipcMain.on('get-all-problems', event => {
    let ids = [];
    db.each(`SELECT * FROM problems;`, [], (err, row) => {
        ids.push(row.id);
    },
    () => {
        event.returnValue = ids;
    });
});

ipcMain.on('get-login-by-id', (event, arg) => {
    db.get(`SELECT * FROM experts WHERE id='${arg}';`, [], (err, row) => {
        if (row) event.returnValue = row.login;
        else event.returnValue = 'error';
    });
});

ipcMain.on('get-name-by-id', (event, arg) => {
    db.get(`SELECT * FROM problems WHERE id='${arg}';`, [], (err, row) => {
        if (row) event.returnValue = row.name;
        else event.returnValue = 'error';
    });
});

ipcMain.on('get-problem-by-id', (event, arg) => {
    
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

    let id = arg;
    let problem;
    let alts = [];


    db.each(`SELECT * FROM alts WHERE problem='${id}' ORDER BY id;`, [], (err, row) => {
        alts.push(row.name);
    }, (err) => {
        db.get(`SELECT * FROM problems WHERE id='${id}';`, [], (err, row) => {
            problem = {
                name: row.name,
                description: row.description,
                alts: alts,
                status: row.status,
                id: id
            };
            db.get(`SELECT * FROM scales WHERE problem='${id}';`, [], (err, row) => {
                problem.scale = row.value;
                event.returnValue = problem;
            })  
        });
    });
});

ipcMain.on('set-solution-by-id', (event, arg) => {
    let expert = Number(arg.expert);
    let solution = arg.solution;
    let method = arg.method;
    let problem = Number(arg.problem);

    console.log(`set-solution: ${[expert, method, problem, solution]}`)


    switch (method) {
        case 'pair':
            db.run(`INSERT INTO solutions_pair (elem_string, expert, problem) VALUES ('${solution}', ${expert}, ${problem});`);
            break;
        case 'rank':
            db.run(`INSERT INTO solutions_rank (elem_string, expert, problem) VALUES ('${solution}', ${expert}, ${problem});`);
            break;
        case 'preference':
            db.run(`INSERT INTO solutions_preference (elem_string, expert, problem) VALUES ('${solution}', ${expert}, ${problem});`);
            break;
        case 'fullpair':
            db.run(`INSERT INTO solutions_full_pair (elem_string, expert, problem) VALUES ('${solution}', ${expert}, ${problem});`);
            break;
        case 'percent':
            db.run(`INSERT INTO solutions_percent (elem_string, expert, problem) VALUES ('${solution}', ${expert}, ${problem});`);
            break;
    }
});

ipcMain.on('save-changes-at-problem-by-id', (event, arg) => {
    if (arg.name) db.run(`UPDATE problems SET name="${arg.name}" WHERE id=${arg.id};`);
    if (arg.description) db.run(`UPDATE problems SET description="${arg.description}" WHERE id=${arg.id};`);
    if (arg.status) db.run(`UPDATE problems SET status="${arg.status}" WHERE id=${arg.id};`);

    if (arg.alts) db.run(`DELETE FROM alts WHERE problem=${arg.id};`, [], () => {
        db.run(`DELETE FROM solutions WHERE problem=${arg.id};`, [], () => {
            for (let item of arg.alts) {
                db.run(`INSERT INTO alts (name, problem) VALUES (?, ?);`, [item, arg.id]);
            }
        });
    });
    if (arg.scale) db.run(`UPDATE scales SET value="${arg.scale}" WHERE problem=${arg.id};`);
    event.returnValue = true;
});

ipcMain.on('delete-problem-by-id', (event, arg) => {
    let id = arg;
    db.run(`DELETE FROM problems WHERE id=${id};`);
    db.run(`DELETE FROM alts WHERE problem=${id};`);
    db.run(`DELETE FROM solutions_pair WHERE problem=${id};`);
    db.run(`DELETE FROM solutions_percent WHERE problem=${id};`);
    db.run(`DELETE FROM solutions_rank WHERE problem=${id};`);
    db.run(`DELETE FROM solutions_preference WHERE problem=${id};`);
    db.run(`DELETE FROM competence WHERE problem=${id};`);
    event.returnValue = true;
});

ipcMain.on('get-solution', (event, arg) => {
    let method = arg.method;

    console.log(`get-solution: ${[arg.problem, arg.expert]}`)

    switch (method) {
        case 'pair':
            db.get(`SELECT * FROM solutions_pair WHERE problem='${arg.problem}' AND expert='${arg.expert}'`, [], (err, row) => {
                if (row) event.returnValue = row.elem_string;
                else event.returnValue = false;
            });
            break;
        case 'rank':
            db.get(`SELECT * FROM solutions_rank WHERE problem='${arg.problem}' AND expert='${arg.expert}'`, [], (err, row) => {
                if (row) event.returnValue = row.elem_string;
                else event.returnValue = false;
            });
            break;
        case 'preference':
            db.get(`SELECT * FROM solutions_preference WHERE problem='${arg.problem}' AND expert='${arg.expert}'`, [], (err, row) => {
                if (row) event.returnValue = row.elem_string;
                else event.returnValue = false;
            });
            break;
        case 'fullpair':
            db.get(`SELECT * FROM solutions_full_pair WHERE problem='${arg.problem}' AND expert='${arg.expert}'`, [], (err, row) => {
                if (row) event.returnValue = row.elem_string;
                else event.returnValue = false;
            });
            break;
        case 'percent':
            db.get(`SELECT * FROM solutions_percent WHERE problem='${arg.problem}' AND expert='${arg.expert}'`, [], (err, row) => {
                if (row) event.returnValue = row.elem_string;
                else event.returnValue = false;
            });
            break;
        default:
            event.returnValue = false;
            break;
    }
})

ipcMain.on('get-all-experts-by-problem-id', (event, arg) => {
    let id = arg;
    let experts = [];
    db.each(`SELECT * FROM competence WHERE problem='${id}'`, [], (err, row) => {
        experts.push(row.expert);
    }, () => {
        event.returnValue = experts;
    });
});



























function createWindow () {
  // Создаем окно браузера.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // и загрузить index.html приложения.
//   mainWindow.loadFile('../public/index.html')

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true
  });


  mainWindow.loadURL(startUrl);
//   mainWindow.loadURL('http://localhost:3000');

  // Отображаем средства разработчика.
    mainWindow.webContents.openDevTools()
}

// Этот метод вызывается когда приложение инициализируется
// и будет готово для создания окон.
// Некоторые API могут использоваться только после возникновения этого события.
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    // На MacOS обычно пересоздают окно в приложении,
    // после того, как на иконку в доке нажали и других открытых окон нету.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Выйти когда все окна закрыты
app.on('window-all-closed', function () {
  // Для приложений и строки меню в macOS является обычным делом оставаться
  // активными до тех пор, пока пользователь не выйдет окончательно используя Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

// В этом файле вы можете включить остальную часть основного процесса вашего приложения
//  Вы также можете поместить их в отдельные файлы и подключить через require.