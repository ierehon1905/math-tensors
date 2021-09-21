import React, { createContext, useContext, useEffect, useState } from "react";
import "./App.css";
import { DEV_3D_TENSOR, DEV_4D_TENSOR } from "./constants";
import { getDepth } from "./tensor";
import { throttle } from "./throttle";

type PositionContextType = {
  tooltip: string;
  startFromOne: boolean;
  position: { x: number; y: number };
  setTooltip: React.Dispatch<
    React.SetStateAction<PositionContextType["tooltip"]>
  >;
  setPosition: React.Dispatch<
    React.SetStateAction<PositionContextType["position"]>
  >;
  setStartFromOne: React.Dispatch<
    React.SetStateAction<PositionContextType["startFromOne"]>
  >;
};

const PositionContext = createContext<PositionContextType>({
  tooltip: "",
  startFromOne: false,
  position: { x: 0, y: 0 },
  setTooltip: () => undefined,
  setPosition: () => undefined,
  setStartFromOne: () => undefined,
});

function useTooltip() {
  const ctx = useContext(PositionContext);
  return ctx;
}

function TableComponent(props: { table: any[] }) {
  const depthAfter = getDepth(props.table) - 2;
  let table = depthAfter === -1 ? [props.table] : props.table;

  return (
    <div
      style={{
        display: "grid",
        gridAutoColumns: depthAfter <= 0 ? "minmax(3ch, max-content)" : "auto",
        gridAutoRows: depthAfter <= 0 ? "minmax(3ch, max-content)" : "auto",
        border: "1px solid gray",
      }}
    >
      {table.flatMap(processRow)}
    </div>
  );

  function processRow(row: any[], rowIndex: number): JSX.Element[] {
    return row.map(procecssCell(rowIndex));
  }

  function procecssCell(
    rowIndex: number
  ): (value: any, index: number) => JSX.Element {
    return (cell, columnIndex) => (
      <div
        style={{
          gridArea: `${rowIndex + 1} / ${columnIndex + 1}`,
          placeSelf: "stretch",
          // placeItems: "stretch",
          // display: "grid",
        }}
        key={`${rowIndex}_${columnIndex}`}
      >
        {depthAfter > 0 ? (
          <TableComponent table={depthAfter === 1 ? [cell] : cell} />
        ) : (
          cell
        )}
      </div>
    );
  }
}

function CellComponent(props: { val: number; index?: number[] }) {
  const { setTooltip, startFromOne } = useTooltip();

  const ownTooltip = props.index
    ?.map((i) => i + Number(startFromOne))
    .join(", ");

  return (
    <div
      style={{
        // cursor: "crosshair",
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
      }}
      onMouseEnter={() => setTooltip(ownTooltip || ":(")}
    >
      <span> {props.val}</span>
    </div>
  );
}

function Tooltip() {
  const { tooltip, position } = useTooltip();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        transform: `translate(${position.x + 10}px, ${position.y}px)`,
        backgroundColor: "white",
        padding: "0.3em",
        borderRadius: "0.3em",
        boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
        pointerEvents: "none",
      }}
    >
      {tooltip}
    </div>
  );
}

function TensorComponent() {
  const [tensor, setTensor] = useState(DEV_3D_TENSOR);
  const { tooltip, setPosition, startFromOne, setStartFromOne } = useTooltip();
  const [isInside, setIsInside] = useState(false);

  const handleMove = throttle((ev: React.PointerEvent) => {
    if (!isInside) setIsInside(true);
    setPosition({
      x: ev.nativeEvent.x,
      y: ev.nativeEvent.y,
    });
  }, 16);
  const handleEnter = () => {
    setIsInside(true);
  };
  const handleLeave = () => {
    setIsInside(false);
  };

  if (tensor.order === 0) {
    return (
      <div>
        <div>Скаляр. (Тензор 0 ранга)</div>
        <code>{tensor.data}</code>
      </div>
    );
  }

  const uiTensor = tensor.mapAny((cell, index) => (
    <CellComponent val={cell} index={index} />
  ));

  return (
    <div>
      <div>Тензор {tensor.order} ранга</div>
      <div>
        Индекс {tooltip}.
        <br />C{" "}
        <label>
          {startFromOne ? "единицы" : "нуля"}{" "}
          <input
            type="checkbox"
            onChange={(e) => setStartFromOne(e.currentTarget.checked)}
          />
        </label>
      </div>
      <code
        style={{ display: "inline-block" }}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        onPointerMove={handleMove}
      >
        <TableComponent table={uiTensor as any[]} />
      </code>
      {isInside && <Tooltip />}
    </div>
  );
}

function App() {
  const [tooltip, setTooltip] = useState("");
  const [startFromOne, setStartFromOne] =
    useState<PositionContextType["startFromOne"]>(false);
  const [position, setPosition] = useState<PositionContextType["position"]>({
    x: 0,
    y: 0,
  });

  return (
    <PositionContext.Provider
      value={{
        tooltip,
        setTooltip,
        position,
        setPosition,
        startFromOne,
        setStartFromOne,
      }}
    >
      <header>
        <h1>Лабораторная работа №1</h1>
        <h2>
          Выполнил студент группы БИСТ-18-1 <strong>Минасян Леон</strong>
        </h2>
      </header>
      <main>
        <section>
          <TensorComponent />
        </section>
      </main>
    </PositionContext.Provider>
  );
}

export default App;
