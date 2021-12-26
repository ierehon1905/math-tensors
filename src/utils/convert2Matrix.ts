import { Tensor } from "./tensor";

const indexMap: Record<number, string[]> = {
    "1": ["11"],
    "2": ["22"],
    "3": ["33"],
    "4": ["23", "32"],
    "5": ["31", "13"],
    "6": ["12", "21"],
};
export const convert2Tensor = (matrix: number[][]): Tensor => {
    const rows = matrix.length;
    const columns = matrix[0].length;

    const tensor = new Tensor([
        [
            [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ],
            [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ],
            [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ],
        ],
        [
            [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ],
            [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ],
            [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ],
        ],
        [
            [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ],
            [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ],
            [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ],
        ],
    ]);

    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const value = matrix[row][column];

            const newIndx1 = indexMap[row + 1];
            const newIndx2 = indexMap[column + 1];

            const combinations: string[] = [];

            for (const part1 of newIndx1) {
                for (const part2 of newIndx2) {
                    combinations.push(part1 + part2);
                }
            }

            for (const combination of combinations) {
                const path = combination.split("").map((char) => Number(char) - 1);
                tensor.set(path, value);
            }
        }
    }

    return tensor;
};
