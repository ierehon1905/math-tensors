type DeepNumArr = number | number[] | DeepNumArr[];
type SimpleOp = (scalar: number, index: number[]) => number;
type GenericOp = (scalar: number, index: number[]) => DeepNumArr;
type AnyOp = SimpleOp | GenericOp;
type MixedIndex = (string | number)[];

function getDepth(data: DeepNumArr, depth = 0): number {
  if (typeof data === "number") {
    return depth;
  }
  return getDepth(data[0], depth + 1);
}

function get(data: DeepNumArr, path: number[]) {
  let head = data;

  for (const p of path) {
    head = (head as number[])[p];
    if (head === undefined) return undefined;
  }
  return head;
}

function set(data: DeepNumArr, path: number[], value: DeepNumArr) {
  if (path.length === 0) {
    return value;
  }
  if (typeof data === "number" && path.length !== 0) {
    throw new Error("У числа не может быть индекса");
  }

  const cloned: DeepNumArr = JSON.parse(JSON.stringify(data));
  let head = cloned as Exclude<DeepNumArr, number>;

  for (let pIndex = 0; pIndex < path.length; pIndex++) {
    const p = path[pIndex];
    // @ts-ignore
    if (!(p in head)) {
      // @ts-ignore
      head[p] = [];
    }

    if (pIndex + 1 !== path.length) {
      head = head[p] as typeof head;
    } else {
      head[p] = value;
    }
  }

  return cloned;
}

export class Tensor {
  constructor(public data: DeepNumArr) {}

  get order() {
    return getDepth(this.data);
  }

  get sum() {
    let sum = 0;
    const op: SimpleOp = (n) => {
      sum += n;
      return 0;
    };

    this.map(op);

    return sum;
  }

  public scalarMult(scalar: number): Tensor {
    const op: SimpleOp = (n) => n * scalar;

    return this.map(op);
  }

  public mult(other: Tensor): Tensor {
    const op: GenericOp = (n) => other.scalarMult(n).data;

    return this.map(op);
  }

  public add(other: Tensor): Tensor {
    const op: SimpleOp = (n, index) => n + (other.get(index) as number);

    return this.map(op);
  }

  public contraction(contractBy: number[]) {
    const t = new Tensor(this.order - 2 > 0 ? [] : 0);
    const op: SimpleOp = (n, index) => {
      const isOnDiagonal = index
        .filter((_, i) => contractBy.includes(i))
        .every((el, _, arr) => el === arr[0]);

      if (isOnDiagonal) {
        const remainedPath = index.filter((_, i) => !contractBy.includes(i));
        const was = (t.get(remainedPath) ?? 0) as number;
        t.set(remainedPath, was + n);
      }
      return 0;
    };

    this.map(op);
    return t;
  }

  public map(op: AnyOp): Tensor {
    const m = new Tensor(this.mapData(this.data, op, []));

    return m;
  }

  private mapData(data: DeepNumArr, op: AnyOp, index: number[]): DeepNumArr {
    if (typeof data === "number") {
      return op(data, index);
    }
    return data.map((subData, subIndex) =>
      this.mapData(subData, op, index.concat(subIndex))
    );
  }

  public get(index: number[]) {
    return get(this.data, index);
  }

  public set(index: number[], value: DeepNumArr) {
    this.data = set(this.data, index, value);
    return;
  }
}
