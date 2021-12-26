import { DEV_2D_TENSOR, DEV_3D_TENSOR, DEV_4D_TENSOR } from "./constants";
import { Tensor } from "./utils/tensor";

describe("Tensor", () => {
  it("works", () => {
    expect(1 + 1).toBe(2);
  });

  describe("calculates order", () => {
    it("of 0", () => {
      const tensor = new Tensor(1);

      expect(tensor.order).toBe(0);
    });

    it("of 1", () => {
      const tensor = new Tensor([1, 2]);

      expect(tensor.order).toBe(1);
    });

    it("of 2", () => {
      const tensor = new Tensor([
        [1, 2],
        [3, 4],
      ]);

      expect(tensor.order).toBe(2);
    });
  });

  describe("multiplication", () => {
    it("with scalar", () => {
      const tensor = new Tensor(2);

      const newTensor = tensor.scalarMult(2);

      expect(newTensor.data).toStrictEqual(4);
    });

    it("with 1d", () => {
      const tensor = new Tensor([1, 2]);

      const newTensor = tensor.scalarMult(2);

      expect(newTensor.data).toStrictEqual([2, 4]);
    });

    it("with 2d", () => {
      const tensor = new Tensor([
        [1, 2],
        [3, 4],
      ]);

      const newTensor = tensor.scalarMult(2);

      expect(newTensor.data).toStrictEqual([
        [2, 4],
        [6, 8],
      ]);
    });
  });

  describe("indexation", () => {
    it("gets scalar", () => {
      const t = new Tensor(1);

      const s = t.get([]);

      expect(s).toBe(1);
    });

    it("gets 1d exact", () => {
      const t = new Tensor([1, 2]);

      const s = t.get([1]);

      expect(s).toBe(2);
    });

    it("gets 1d column", () => {
      const t = new Tensor([1, 2]);

      const s = t.get([]);

      expect(s).toStrictEqual([1, 2]);
    });

    it("gets 2d exact", () => {
      const t = new Tensor([
        [1, 2],
        [3, 4],
      ]);

      const s = t.get([1, 1]);

      expect(s).toBe(4);
    });

    it("gets 2d column", () => {
      const t = new Tensor([
        [1, 2],
        [3, 4],
      ]);

      const s = t.get([1]);

      expect(s).toStrictEqual([3, 4]);
    });

    it("gets impossible scalar", () => {
      const t = new Tensor(1);

      const s = t.get([1]);

      expect(s).toBeUndefined();
    });

    it("gets impossible 1d", () => {
      const t = new Tensor([1, 2]);

      const s = t.get([0, 0]);

      expect(s).toBeUndefined();
    });
  });

  describe("setting value", () => {
    it("sets scalar", () => {
      const t = new Tensor(1);

      t.set([], 10);

      expect(t.data).toStrictEqual(10);
    });

    it("sets 1d exact", () => {
      const t = new Tensor([1, 2]);

      t.set([0], 10);

      expect(t.data).toStrictEqual([10, 2]);
    });

    it("sets 1d column", () => {
      const t = new Tensor([1, 2]);

      t.set([], [3, 4]);

      expect(t.data).toStrictEqual([3, 4]);
    });

    it("sets deep", () => {
      const t = new Tensor([]);

      t.set([0, 0, 0], 10);

      expect(t.data).toStrictEqual([[[10]]]);
    });
  });

  describe("addition", () => {
    it("adds scalars", () => {
      const A = new Tensor(1);
      const B = new Tensor(2);

      const C = A.add(B);

      expect(C.data).toBe(3);
    });

    it("adds 1d", () => {
      const A = new Tensor([1, 2]);
      const B = new Tensor([3, 4]);

      const C = A.add(B);

      expect(C.data).toStrictEqual([4, 6]);
    });

    it("adds 2d", () => {
      const A = new Tensor([
        [1, 2],
        [3, 4],
      ]);
      const B = new Tensor([
        [1, 2],
        [3, 4],
      ]);

      const C = A.add(B);

      expect(C.data).toStrictEqual([
        [2, 4],
        [6, 8],
      ]);
    });
  });

  describe("sums", () => {
    it("scalar", () => {
      const t = new Tensor(2);

      expect(t.sum).toBe(2);
    });

    it("1d", () => {
      const t = new Tensor([1, 2]);

      expect(t.sum).toBe(3);
    });

    it("2d", () => {
      const t = new Tensor([
        [1, 2],
        [3, 4],
      ]);

      expect(t.sum).toBe(10);
    });
  });

  describe("tensor product", () => {
    it("multiplies scalars", () => {
      const A = new Tensor(1);
      const B = new Tensor(2);

      const C = A.mult(B);

      expect(C.data).toStrictEqual(2);
    });

    it("multiplies 1d", () => {
      const A = new Tensor([1, 2]);
      const B = new Tensor([3, 4]);

      const C = A.mult(B);

      expect(C.data).toStrictEqual([
        [3, 4],
        [6, 8],
      ]);
    });

    it("multiplies 2d", () => {
      const A = new Tensor([
        [1, 2],
        [3, 4],
      ]);
      const B = new Tensor([
        [5, 6],
        [7, 8],
      ]);

      const C = A.mult(B);

      const res = new Tensor([
        [
          [
            [5, 6],
            [7, 8],
          ],
          [
            [10, 12],
            [14, 16],
          ],
        ],
        [
          [
            [15, 18],
            [21, 24],
          ],
          [
            [20, 24],
            [28, 32],
          ],
        ],
      ]);

      expect(C.order).toBe(res.order);
      expect(C.data).toStrictEqual(res.data);
    });
  });

  describe("contraction", () => {
    it("contracts 2d", () => {
      const t = new Tensor([
        [1, 2, 3],
        [5, 6, 6],
        [7, 8, 9],
      ]);

      const c = t.contraction([0, 1]);

      expect(c.data).toStrictEqual(16);
    });

    it("contracts 2d small", () => {
      const t = DEV_2D_TENSOR;

      const c = t.contraction([0, 1]);

      expect(c.data).toStrictEqual(7);
    });

    it("contracts 3d", () => {
      const t = DEV_3D_TENSOR;

      const c = t.contraction([1, 2]);

      expect(c.data).toStrictEqual([16, 24, 18]);
    });

    it("contracts 3d 2", () => {
      const t = new Tensor([
        [
          [1, 2, 3],
          [5, 6, 6],
          [7, 8, 9],
        ],
        [
          [10, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ],
        [
          [9, 3, 8],
          [9, 2, 6],
          [1, 3, 4],
        ],
      ]);

      const c = t.contraction([0, 2]);

      expect(c.data).toStrictEqual([11, 16, 19]);
    });

    it("contracts 4d", () => {
      const t = DEV_4D_TENSOR;

      const c = t.contraction([2, 3]); // x y 1 1

      expect(c.data).toStrictEqual([
        [24, 32],
        [18, 18],
      ]);
    });
  });
});
