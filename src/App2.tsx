import React, { useState } from "react";
import { SubmitHandler, useForm, useFieldArray } from "react-hook-form";
import "./App.css";
import { Mineral, minerals } from "./minerals";
import { calculateHardness } from "./utils/calculateHardness";
import { getSpeed, GetSpeedOptions } from "./utils/getSpeed";
import { getTime } from "./utils/getTime";
import { sp, Sparse } from "./utils/sparse";

type OptionsForSpeed = Record<keyof Omit<GetSpeedOptions, "hardness">, number>;

type Inputs = {
  minerals: Mineral[];
  depth: number;
  hitEnergyLeft: number;
  hitEnergyRight: number;
} & OptionsForSpeed;

const deepNumberify = (obj: Record<string, any>): void => {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "object") {
      deepNumberify(value);
    } else if (typeof value === "string" && /\d+(\.\d+)?/.test(value)) {
      obj[key] = Number(value);
    } else if (typeof value === "number") {
    } else {
      throw new Error(`Unkown stuff ${key} ${value}`);
    }
  }
};

const iterateHardness = (minerals: Mineral[]) => {
  const maxHardness = minerals
    .map((m) => m.hardness)
    .reduce((min, cur) => Math.max(min, cur), 0);

  let hardness = maxHardness;

  const someAreBigger = (_hardness: number) =>
    minerals
      .map((m) => [m.hardness, calculateHardness(m, _hardness)])
      .some(([originalHardness, calculated]) => originalHardness > calculated);

  let leftBorder = 0;

  let safe = 0;
  while (someAreBigger(hardness) && safe < 1000) {
    safe++;
    leftBorder = hardness;
    hardness *= 2;
  }

  let rightBorder = hardness;
  let maxBinarySearchIterations = 12;
  let binarySearchIterations = 0;
  let midHardness = -1;
  let isHardnessSmall = false;
  while (
    leftBorder < rightBorder &&
    binarySearchIterations < maxBinarySearchIterations
  ) {
    console.log({ leftBorder, rightBorder });

    binarySearchIterations++;

    midHardness = leftBorder / 2 + rightBorder / 2;

    isHardnessSmall = someAreBigger(midHardness);

    if (isHardnessSmall) {
      leftBorder = midHardness;
    } else {
      rightBorder = midHardness;
    }
  }

  return isHardnessSmall ? rightBorder : midHardness;
};

const formatter = new Intl.RelativeTimeFormat("ru", {
  numeric: "auto",
  style: "long",
});

function App2() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    control,
    setValue,
  } = useForm<Inputs>();
  const [timeH, setTimeH] = useState<Sparse>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    deepNumberify(data);

    const midHardness = iterateHardness(data.minerals);

    const speed = getSpeed({
      hardness: sp(midHardness).toArray(),
      diameter: sp(data.diameter).toArray(),
      enterAngle: sp(data.enterAngle).toArray(),
      errAngle: sp(data.errAngle).toArray(),
      hitEnergy: sp(
        data.hitEnergy,
        data.hitEnergyLeft,
        data.hitEnergyRight
      ).toArray(),
      hitFrequency: sp(data.hitFrequency).toArray(),
    });

    const time = getTime({
      speed: speed.toArray(),
      depth: [data.depth, 0, 0],
    });

    // console.log({ speed, timeH: time.m / 3600 })
    setTimeH(time.div(3600));

    // console.log({ midHardness });
  };

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control,
      name: "minerals",
    }
  );

  return (
    <>
      <header>
        <h1>Лабораторная работа №4</h1>
        <h2>
          Выполнил студент группы БИСТ-18-1 <strong>Минасян Леон</strong>
        </h2>
      </header>
      <main style={{ maxWidth: 900, margin: "auto" }}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "inline-block" }}
        >
          <div
            style={{
              display: "flex",
              gap: "1em",
              marginBottom: "1em",
              flexWrap: "wrap",
            }}
          >
            {fields.map((mineralForm, mineralIndex) => (
              <div
                key={mineralForm.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "0.5em",
                  border: "1px solid lightgray",
                  borderRadius: "0.5em",
                  position: "relative",
                }}
              >
                <button
                  style={{ position: "absolute", top: "0.5em", right: "0.5em" }}
                  onClick={() => remove(mineralIndex)}
                >
                  x
                </button>
                <label>
                  Пресет
                  <br />
                  <select
                    name="preset"
                    onChange={(e) => {
                      console.log(e.currentTarget.value);
                      const mineral = minerals.find(
                        (m) => m.name === e.currentTarget.value
                      );

                      if (!mineral) {
                        throw new Error("No preset mineral found");
                      }

                      setValue(`minerals.${mineralIndex}.v_p`, mineral.v_p);
                      setValue(`minerals.${mineralIndex}.V_s`, mineral.V_s);
                    }}
                    defaultValue={""}
                  >
                    <option value="" disabled>
                      Выберите минерал
                    </option>
                    {minerals.map((m) => (
                      <option key={m.name}>{m.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  v_p
                  <br />
                  <input
                    {...register(`minerals.${mineralIndex}.v_p`)}
                    type="number"
                    step="any"
                    required
                  />
                </label>
                <label>
                  V_s
                  <br />
                  <input
                    {...register(`minerals.${mineralIndex}.V_s`)}
                    type="number"
                    step="any"
                    required
                  />
                </label>
                <label>
                  Доля породы (f1)
                  <br />
                  <input
                    {...register(`minerals.${mineralIndex}.share`)}
                    type="number"
                    step="any"
                    required
                    min={0}
                    max={1}
                    defaultValue={minerals[0].share}
                  />
                </label>
                <label>
                  Давление газов (p) (Па)
                  <br />
                  <input
                    {...register(`minerals.${mineralIndex}.p`)}
                    type="number"
                    step="any"
                    required
                    defaultValue={minerals[0].p}
                  />
                </label>
                <label>
                  Предел прочности (Па)
                  <br />
                  <input
                    {...register(`minerals.${mineralIndex}.hardness`)}
                    type="number"
                    step="any"
                    required
                    defaultValue={minerals[0].hardness}
                  />
                </label>
              </div>
            ))}
          </div>
          <button onClick={() => append({})}>Добавить минерал</button>
          <br />
          <div
            style={{
              border: "1px solid lightgray",
              borderRadius: "0.5em",
              padding: "0.5em",
            }}
          >
            <label>
              Энергия удара (Дж)
              <br />
              <input
                {...register("hitEnergy")}
                type="number"
                step="any"
                defaultValue={1_000_000}
              />
            </label>
            left:{" "}
            <input
              {...register("hitEnergyLeft")}
              type="number"
              step="any"
              defaultValue={0}
            />
            right:{" "}
            <input
              {...register("hitEnergyRight")}
              type="number"
              step="any"
              defaultValue={0}
            />
          </div>
          <label>
            Частота ударов (в сек)
            <br />
            <input
              {...register("hitFrequency")}
              type="number"
              step="any"
              defaultValue={15}
            />
          </label>
          <label>
            Угол вхождения (рад)
            <br />
            <input
              {...register("enterAngle")}
              type="number"
              step="any"
              defaultValue={1.57}
            />
          </label>
          <label>
            Угол отклонения (рад)
            <br />
            <input
              {...register("errAngle")}
              type="number"
              step="any"
              defaultValue={0}
            />
          </label>
          <label>
            Диаметр долота (м)
            <br />
            <input
              {...register("diameter")}
              type="number"
              step="any"
              defaultValue={0.2}
            />
          </label>

          <label>
            Глубина бурения (м)
            <br />
            <input
              {...register("depth")}
              type="number"
              step="any"
              defaultValue={10}
            />
          </label>
          <br />
          <br />
          <br />
          <input type="submit" />
        </form>

        {timeH && (
          <div>
            Бурение выполнится {formatter.format(Math.trunc(timeH.m), "hour")}
            (L: {timeH.a.toPrecision(3)}
            R: {timeH.b.toPrecision(3)})
          </div>
        )}
      </main>
    </>
  );
}

export default App2;
