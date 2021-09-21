import React, { useState } from "react";
import "./App.css";
import { DEV_4D_TENSOR } from "./constants";
import { getDepth } from "./tensor";

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
          placeSelf: "center",
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
  return <div title={props.index?.join(", ")}>{props.val}</div>;
}

function TensorComponent() {
  const [tensor, setTensor] = useState(DEV_4D_TENSOR);

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
      <code style={{ display: "inline-block" }}>
        <TableComponent table={uiTensor as any[]} />
      </code>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
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
    </>
  );
}

export default App;
