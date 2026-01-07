"use client";

import { useState } from "react";
import { Calculator as CalculatorIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

export function Calculator() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "*":
        return firstValue * secondValue;
      case "/":
        return firstValue / secondValue;
      case "=":
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    if (previousValue !== null && operation) {
      const inputValue = parseFloat(display);
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay("0.");
      setWaitingForNewValue(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const scientificFunction = (func: string) => {
    const value = parseFloat(display);
    let result = 0;

    switch (func) {
      case "sin":
        result = Math.sin(value * (Math.PI / 180));
        break;
      case "cos":
        result = Math.cos(value * (Math.PI / 180));
        break;
      case "tan":
        result = Math.tan(value * (Math.PI / 180));
        break;
      case "log":
        result = Math.log10(value);
        break;
      case "ln":
        result = Math.log(value);
        break;
      case "sqrt":
        result = Math.sqrt(value);
        break;
      case "square":
        result = value * value;
        break;
      case "inverse":
        result = 1 / value;
        break;
      case "pi":
        result = Math.PI;
        break;
      case "e":
        result = Math.E;
        break;
      default:
        return;
    }

    setDisplay(String(result));
    setWaitingForNewValue(true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="fixed top-4 right-4 z-50">
          <CalculatorIcon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-4">
        <Card className="p-4">
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">Scientific Calculator</h3>
              <Button variant="ghost" size="icon" onClick={clear}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="rounded border bg-muted p-4 text-right text-2xl font-mono">
              {display}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {/* Scientific functions */}
            <Button variant="outline" size="sm" onClick={() => scientificFunction("sin")}>
              sin
            </Button>
            <Button variant="outline" size="sm" onClick={() => scientificFunction("cos")}>
              cos
            </Button>
            <Button variant="outline" size="sm" onClick={() => scientificFunction("tan")}>
              tan
            </Button>
            <Button variant="outline" size="sm" onClick={() => scientificFunction("log")}>
              log
            </Button>
            <Button variant="outline" size="sm" onClick={() => scientificFunction("ln")}>
              ln
            </Button>

            <Button variant="outline" size="sm" onClick={() => scientificFunction("sqrt")}>
              √
            </Button>
            <Button variant="outline" size="sm" onClick={() => scientificFunction("square")}>
              x²
            </Button>
            <Button variant="outline" size="sm" onClick={() => scientificFunction("inverse")}>
              1/x
            </Button>
            <Button variant="outline" size="sm" onClick={() => scientificFunction("pi")}>
              π
            </Button>
            <Button variant="outline" size="sm" onClick={() => scientificFunction("e")}>
              e
            </Button>

            {/* Numbers and operations */}
            <Button variant="outline" size="sm" onClick={clear} className="col-span-2">
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={() => inputOperation("/")}>
              ÷
            </Button>
            <Button variant="outline" size="sm" onClick={() => inputOperation("*")}>
              ×
            </Button>

            <Button variant="outline" size="sm" onClick={() => inputNumber("7")}>
              7
            </Button>
            <Button variant="outline" size="sm" onClick={() => inputNumber("8")}>
              8
            </Button>
            <Button variant="outline" size="sm" onClick={() => inputNumber("9")}>
              9
            </Button>
            <Button variant="outline" size="sm" onClick={() => inputOperation("-")}>
              −
            </Button>

            <Button variant="outline" size="sm" onClick={() => inputNumber("4")}>
              4
            </Button>
            <Button variant="outline" size="sm" onClick={() => inputNumber("5")}>
              5
            </Button>
            <Button variant="outline" size="sm" onClick={() => inputNumber("6")}>
              6
            </Button>
            <Button variant="outline" size="sm" onClick={() => inputOperation("+")} rowSpan={2}>
              +
            </Button>

            <Button variant="outline" size="sm" onClick={() => inputNumber("1")}>
              1
            </Button>
            <Button variant="outline" size="sm" onClick={() => inputNumber("2")}>
              2
            </Button>
            <Button variant="outline" size="sm" onClick={() => inputNumber("3")}>
              3
            </Button>
            <Button variant="outline" size="sm" onClick={performCalculation} rowSpan={2}>
              =
            </Button>

            <Button variant="outline" size="sm" onClick={() => inputNumber("0")} className="col-span-2">
              0
            </Button>
            <Button variant="outline" size="sm" onClick={inputDecimal}>
              .
            </Button>
          </div>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
