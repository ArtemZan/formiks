import { useColorModeValue } from "@chakra-ui/react";
import { StylesConfig } from "react-select";

export function ShadeColor(color: string, amount: number) {
  return (
    "#" +
    color
      .replace(/^#/, "")
      .replace(/../g, (color) =>
        (
          "0" +
          Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)
        ).substring(-2)
      )
  );
}

export function DefaultSelectStyles(color: any) {
  return {
    menu: (provided: any) => ({
      ...provided,
      zIndex: 1000000,
      backgroundColor: color("white", "#21252A"),
    }),
    input: (provided: any) => ({
      ...provided,
      color: color("#718196", "#ABB2BF"),
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: color("#718196", "#ABB2BF"),
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 1000000,
    }),
    control: (base: any, state: any) => ({
      ...base,
      minHeight: 40,
      border: `1px solid ${color("#E2E8F0", "#3E4249")}`,
      transition: "0.3s",
      "&:hover": {
        border: `1px solid ${color("#CBD5E0", "#565e71")}`,
      },
      backgroundColor: color("white", "#2C313C"),
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? color("#3182CE", "#565e71")
        : color("white", "#21252A"),
      "&:hover": {
        backgroundColor: state.isSelected
          ? color("#3182CE", "#565e71")
          : color("#DEEBFF", "#404654"),
      },
    }),
    multiValue: (styles: any, { data }: any) => {
      return {
        ...styles,
        backgroundColor: color("#E6E6E6", "#565e71"),
      };
    },
    multiValueLabel: (styles: any, { data }: any) => ({
      ...styles,
      color: color("#333333", "#ABB2BF"),
    }),
    multiValueRemove: (styles: any, { data }: any) => ({
      ...styles,
      ":hover": {
        backgroundColor: color("#ffcdcd", "#70565f"),
        color: "red",
      },
    }),
  };
}
