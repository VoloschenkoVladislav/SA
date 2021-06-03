export class AnalysMatrix {

    //str = '3120'
    static pair_comp(str) {
        let matrix = [];
        let str_pos = 1;

        str = str.split('');
        str = str.map(function(i){return Number(i)})

        for(let i = 0; i < str[0]; i++) {
            matrix.push(new Array(str[0]).fill(0));
        }

        for (let i = 1; i < str[0]; i++) {
            for(let j = 0; j < i; j++) {
                   matrix[i][j] = str[str_pos] / 2;
                   matrix[j][i] = 1 - str[str_pos] / 2;
                str_pos++;
            }
        }

        let weights = [];
        let order = [];
        let count = 0;
        let memory;
        for(let i = 0; i < matrix[0].length; i++) {
            for(let j = 0; j < matrix[0].length; j++) {
                count += matrix[i][j];
            }
            order.push(i);
            weights.push(count);
            count = 0;
        }

        let final_weights = weights.slice();

        for(let i = 0; i < matrix[0].length - 1; i++) {
            for(let j = i + 1; j < matrix[0].length; j++) {
                if (weights[i] < weights[j]) {
                    memory = weights[i];
                    weights[i] = weights[j];
                    weights[j] = memory;
                    memory = order[i];
                    order[i] = order[j];
                    order[j] = memory;
                }
            }
        }

        let ranks = [];
        for (let i = 0; i < weights.length; i++) {
            ranks.push(weights.length + 1);
        }

        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < weights.length; j++) {
                if (final_weights[i] >= final_weights[j]) {
                    ranks[i] -= 1;
                }
            }
        }

        let sum_str = 0;
        for (let i = 1; i < ranks.length; i++) {
            for (let j = 0; j < ranks.length; j++) {
                if (ranks[j] == i) {
                    sum_str += 1;
                }
            }
            for (let j = 0; j < ranks.length; j++) {
                if (ranks[j] > i) {
                    ranks[j] = ranks[j] - sum_str + 1;
                }
            }
            sum_str = 0;
        }

        return {
            order: order,
            weights: final_weights,
            ranks: ranks
        }

    }

    //input = ['0;4;5;8;1', '3;4;2;1;6']
    static rank(input) {
        let matrix = [];
        
        for (let i = 0; i < input.length; i++) {
            matrix[i] = input[i].split(';');
            matrix[i] = matrix[i].map(function(i){return Number(i)})
        }
        
        //Составляется матрица нормированных оценок альтернатив
        let sum_of_marks = 0;
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                sum_of_marks += matrix[i][j];
            }
            for (let j = 0; j < matrix[i].length; j++) {
                matrix[i][j] /= sum_of_marks;
            }
            sum_of_marks = 0;
        }

        //Вычисяются искомые веса альтернатив
        let weights = [];

        for (let j = 0; j < matrix[0].length; j++) {
            weights[j] = 0;
            for (let i = 0; i < matrix.length; i++) {
                weights[j] += matrix[i][j] / matrix.length;
            }
        }

        //Вычисляются ранги
        let ranks = [];

        for (let i = 0; i < weights.length; i++) {
            ranks.push(weights.length + 1);
        }

        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < weights.length; j++) {
                if (weights[i] >= weights[j]) {
                    ranks[i] -= 1;
                }
            }
        }

        let sum_str = 0;
        for (let i = 1; i < ranks.length; i++) {
            for (let j = 0; j < ranks.length; j++) {
                if (ranks[j] == i) {
                    sum_str += 1;
                }
            }
            for (let j = 0; j < ranks.length; j++) {
                if (ranks[j] > i) {
                    ranks[j] = ranks[j] - sum_str + 1;
                }
            }
            sum_str = 0;
        }

        //Упорядочивание альтернатив
        let order = [];
        for (let i = 1; i <= ranks.length; i++) {
            for (let j = 0; j < ranks.length; j++) {
                if (ranks[j] == i) {
                    order.push(j);
                }
            }
        }

        return {
            order: order,
            weights: weights,
            ranks: ranks
        }

    }

    //input = ['1;2;3;4', '3;2;1;4']
    static preference(input) {
        let matrix = [];
        
        for (let i = 0; i < input.length; i++) {
            matrix[i] = input[i].split(';');
            matrix[i] = matrix[i].map(function(i){return Number(i)})
        }

        //Составляется модифицированная матрица предпочтений
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                matrix[i][j] = matrix[i].length - matrix[i][j];
            }
        }

        //Находятся суммарные оценки предпочтений
        let marks = [];
        let sum_marks = 0;

        for (let j = 0; j < matrix[0].length; j++) {
            marks[j] = 0;
            for (let i = 0; i < matrix.length; i++) {
                marks[j] += matrix[i][j];
            }
            sum_marks += marks[j];
        }
        
        //Вычисяются искомые веса альтернатив
        let weights = [];

        for (let j = 0; j < marks.length; j++) {
            weights[j] = marks[j] / sum_marks;
        }

        //Вычисляются ранги
        let ranks = [];

        for (let i = 0; i < weights.length; i++) {
            ranks.push(weights.length + 1);
        }

        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < weights.length; j++) {
                if (weights[i] >= weights[j]) {
                    ranks[i] -= 1;
                }
            }
        }

        let sum_str = 0;
        for (let i = 1; i < ranks.length; i++) {
            for (let j = 0; j < ranks.length; j++) {
                if (ranks[j] == i) {
                    sum_str += 1;
                }
            }
            for (let j = 0; j < ranks.length; j++) {
                if (ranks[j] > i) {
                    ranks[j] = ranks[j] - sum_str + 1;
                }
            }
            sum_str = 0;
        }

        //Упорядочивание альтернатив
        let order = [];
        for (let i = 1; i <= ranks.length; i++) {
            for (let j = 0; j < ranks.length; j++) {
                if (ranks[j] == i) {
                    order.push(j);
                }
            }
        }

        return {
            order: order,
            weights: weights,
            ranks: ranks
        }
    }

    //input = ['0.2;0.3;0.4;0.1', '0.3;0.2;0.1;0.4'], comp_assess = '10;6;2'
    static expert_assess(input, comp_assess) {
        let matrix = [];
        
        comp_assess = comp_assess.split(';');
        comp_assess = comp_assess.map(function(i){return Number(i)})

        for (let i = 0; i < input.length; i++) {
            matrix[i] = input[i].split(';');
            matrix[i] = matrix[i].map(function(i){return Number(i)})
        }

        //Определяются относительные оценки компетенций
        let sum_assess = 0;
        for (let i = 0; i < comp_assess.length; i++) {
            sum_assess += comp_assess[i];
        }
        for (let i = 0; i < comp_assess.length; i++) {
            comp_assess[i] = comp_assess[i] / sum_assess;
        }

        //Вычисляются веса
        let weights = [];

        for (let j = 0; j < matrix[0].length; j++) {
            weights[j] = 0;
            for (let i = 0; i < matrix.length; i++) {
                weights[j] += matrix[i][j] * comp_assess[i];
            }
        }

        //Вычисляются ранги
        let ranks = [];

        for (let i = 0; i < weights.length; i++) {
            ranks.push(weights.length + 1);
        }

        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < weights.length; j++) {
                if (weights[i] >= weights[j]) {
                    ranks[i] -= 1;
                }
            }
        }

        let sum_str = 0;
        for (let i = 1; i < ranks.length; i++) {
            for (let j = 0; j < ranks.length; j++) {
                if (ranks[j] == i) {
                    sum_str += 1;
                }
            }
            for (let j = 0; j < ranks.length; j++) {
                if (ranks[j] > i) {
                    ranks[j] = ranks[j] - sum_str + 1;
                }
            }
            sum_str = 0;
        }

        //Упорядочивание альтернатив
        let order = [];
        for (let i = 1; i <= ranks.length; i++) {
            for (let j = 0; j < ranks.length; j++) {
                if (ranks[j] == i) {
                    order.push(j);
                }
            }
        }

        return {
            order: order,
            weights: weights,
            ranks: ranks
        }


    }


    //input = ['3;0.25;0.4;0.1', '3;0.2;0.6;0.2']
    static full_pair_comp(input) {
        let matrix = [];
        let input_pos = 1;
        let matrices = [];
        //Переменная, используется для 3 пункта задания
        let n = input[0][0] * (input[0][0] - 1);
        //Приводим input к читабельному виду
        for (let i = 0; i < input.length; i++) {
            input[i] = input[i].split(';');
            input[i] = input[i].map(function(i){return Number(i)});
        }
        //Создаем матрицы частот из исходных данных
        for (let num = 0; num < input.length; num++) {
            for(let i = 0; i < input[0][0]; i++) {
                matrix.push(new Array(input[0][0]).fill(0));
            }
            matrices[num] = matrix.slice();
            matrix = [];
        }
        for (let num = 0; num < matrices.length; num++) {
            for (let i = 1; i < input[0][0]; i++) {
                for(let j = 0; j < i; j++) {
                    matrices[num][i][j] = input[num][input_pos];
                    matrices[num][j][i] = 1 - input[num][input_pos];
                    input_pos++;
                }
            }
            input_pos = 1;
        }
        //Определяем оценки предпочтений каждого эксперта
        let evaluation = [];
        for(let i = 0; i < input.length; i++) {
            evaluation.push(new Array(input[0][0]).fill(0));
        }
        for (let num = 0; num < matrices.length; num++) {
            for (let i = 0; i < matrices[num].length; i++) {
                for(let j = 0; j < matrices[num][i].length; j++) {
                    evaluation[num][i] += matrices[num][i][j];
                }
            }
        }
        //Определяются нормированные оценки
        for (let i = 0; i < evaluation.length; i++) {
            for (let j = 0; j < evaluation[i].length; j++) {
                evaluation[i][j] /= n;
            }
        }
        //Определяем веса альтернатив
        let weights = new Array(input[0][0]).fill(0);
        for (let i = 0; i < evaluation.length; i++) {
            for (let j = 0; j < evaluation[i].length; j++) {
                weights[j] += evaluation[i][j];
            }
        }
        //Вычисляются ранги
        let ranks = [];
        for (let i = 0; i < weights.length; i++) {
            ranks.push(weights.length + 1);
        }
        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < weights.length; j++) {
                if (weights[i] >= weights[j]) {
                    ranks[i] -= 1;
                }
            }
        }
        let sum_str = 0;
        for (let i = 1; i < ranks.length; i++) {
            for (let j = 0; j < ranks.length; j++) {
                if (ranks[j] == i) {
                    sum_str += 1;
                }
            }
            for (let j = 0; j < ranks.length; j++) {
                if (ranks[j] > i) {
                    ranks[j] = ranks[j] - sum_str + 1;
                }
            }
            sum_str = 0;
        }
        //Упорядочивание альтернатив
        let order = [];
        for (let i = 1; i <= ranks.length; i++) {
            for (let j = 0; j < ranks.length; j++) {
                if (ranks[j] == i) {
                    order.push(j);
                }
            }
        }
        return {
            order: order,
            weights: weights,
            ranks: ranks
        }
    }

}