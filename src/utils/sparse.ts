export class Sparse {
  constructor(public m: number, public a: number, public b: number) {}

  add(_other: Sparse | number): Sparse {
    const other = Sparse.normalize(_other);
    return new Sparse(this.m + other.m, this.a + other.a, this.b + other.b);
  }
  sub(_other: Sparse | number): Sparse {
    const other = Sparse.normalize(_other);

    return new Sparse(this.m - other.m, this.a + other.b, other.a + this.b);
  }

  mult(_other: Sparse | number): Sparse {
    const other = Sparse.normalize(_other);

    const { m: m_1, a: a_1, b: b_1 } = this;
    const { m: m_2, a: a_2, b: b_2 } = other;

    if (m_1 > 0 && m_2 > 0) {
      return new Sparse(
        m_1 * m_2,
        m_1 * a_2 + m_2 * a_1 - a_1 * a_2,
        m_1 * b_2 + m_2 * b_1 - b_1 * b_2
      );
    } else if (m_1 > 0 && m_2 < 0) {
      return new Sparse(
        m_1 * m_2,
        m_1 * a_2 - m_2 * b_1 - a_2 * b_1,
        m_1 * b_2 - m_2 * a_1 - a_1 * b_2
      );
    } else if (m_1 < 0 && m_2 > 0) {
      return new Sparse(
        m_1 * m_2,
        -m_1 * b_2 + m_2 * a_1 + a_1 * b_2,
        -m_1 * a_2 + m_2 * b_1 - a_2 * b_1
      );
    }

    throw new Error("Unknown branch in sparse mult");
  }

  div(_other: Sparse | number): Sparse {
    const other = Sparse.normalize(_other);

    const { m: m_1, a: a_1, b: b_1 } = this;
    const { m: m_2, a: a_2, b: b_2 } = other;

    if (m_1 > 0 && m_2 > 0) {
      return new Sparse(
        m_1 / m_2,
        (m_1 * b_2 + m_2 * a_1) / (m_2 * (m_2 + b_2)),
        (m_1 * a_2 + m_2 * b_1) / (m_2 * (m_2 - a_2))
      );
    } else if (m_1 > 0 && m_2 < 0) {
      return new Sparse(
        m_1 / m_2,
        (m_1 * b_2 - m_2 * b_1) / (m_2 * (m_2 + b_2)),
        (m_1 * a_2 - m_2 * a_1) / (m_2 * (m_2 - a_2))
      );
    } else if (m_1 < 0 && m_2 > 0) {
      return new Sparse(
        m_1 / m_2,
        (-m_1 * a_2 + m_2 * a_1) / (m_2 * (m_2 - a_2)),
        (-m_1 * b_2 + m_2 * b_1) / (m_2 * (m_2 + b_2))
      );
    } else if (m_1 < 0 && m_2 < 0) {
      return new Sparse(
        m_1 / m_2,
        (-m_1 * a_2 - m_2 * b_1) / (m_2 * (m_2 - a_2)),
        (-m_1 * b_2 - m_2 * a_1) / (m_2 * (m_2 + b_2))
      );
    }

    throw new Error(`Unknown branch in sparse div m1: ${m_1} m2: ${m_2}`);
  }

  toArray(): [number, number, number] {
    return [this.m, this.a, this.b];
  }

  //   gt() {}

  private static normalize(value: Sparse | number): Sparse {
    const other = typeof value === "number" ? sp(value) : value;
    return other;
  }
}

export const sp = (m: number, a = 0, b = 0) => new Sparse(m, a, b);
