import { Button, Tag } from "@chakra-ui/react";
import moment from "moment";
import React from "react";
import DatePicker from "react-datepicker";
import Creatable from "react-select/creatable";
import { NumberWithCommas } from "../utils/Numbers";

const numRegex = /[0-9.\-/]|\./;

function isValidDate(d: any) {
  return d instanceof Date && !isNaN(d as any);
}

class EditableTableCell extends React.Component<
  {
    onUpdate: any;
    rowIndex: number;
    rowData: any;
    columnKey: string | undefined;
    loadOptions?: any;
    type: string;
    initialValue: any;
    textColor?: any;
    backgroundColor?: string;
    readonly?: boolean;
    bold?: boolean;
    maxLength?: number;
    invoiced?: boolean;
    printLog?: boolean;
  },
  {
    cellValue: any;
    options: any[];
    editing: boolean;
  }
> {
  constructor(props: any) {
    super(props);

    this.state = {
      options: [],
      cellValue: undefined,
      editing: false,
    };
  }
  componentDidUpdate(prevProps: any) {
    if (prevProps.initialValue !== this.props.initialValue) {
      if (this.props.type === "number" && isNaN(this.props.initialValue)) {
        return;
      }
      this.setState({ cellValue: this.props.initialValue });
    }
  }

  componentDidMount() {
    if(this.props.printLog) {
      // console.log('rowData', this.props.rowData);
    }

    var value: any = undefined;
    if (this.props.rowData.id === "total") {
      value = this.props.initialValue ? this.props.initialValue : "";
    } else {
      switch (this.props.type) {
        case "text":
        case "button":
          value = this.props.initialValue
            ? this.props.initialValue.toString()
            : "";
          break;
        case "number":
          value =
            typeof this.props.initialValue === "number"
              ? NumberWithCommas(this.props.initialValue)
              : "";
          break;
        case "tags":
          value = this.props.initialValue;
          break;
        case "date":
          value =
            this.props.initialValue && this.props.initialValue !== null
              ? new Date(this.props.initialValue)
              : null;
          break;
        case "dropdown":
          value =
            typeof this.props.initialValue === "string"
              ? {
                  label: this.props.initialValue,
                  value: this.props.initialValue,
                }
              : { label: "", value: "" };
          break;
        case "value-dropdown":
          value =
            typeof this.props.initialValue === "string"
              ? {
                  label: this.props.initialValue,
                  value: this.props.initialValue,
                }
              : { label: "", value: "" };
          break;
        case "multiple-dropdown":
          value = [];
          if (
            this.props.initialValue &&
            Array.isArray(this.props.initialValue)
          ) {
            this.props.initialValue.forEach((v: any) => {
              value.push(v);
            });
          }
          break;
        case "menu":
          value = this.props.initialValue
            ? this.props.initialValue.toString()
            : "";
          break;
        default:
          break;
      }
    }
    this.setState({ cellValue: value });
  }

  render() {
    return (
      <div
        style={{
          fontWeight: this.props.bold ? "bold" : "normal",
          textAlign: this.props.type === "button" ? "center" : "inherit",
          backgroundColor:
            this.props.rowData.id === "total"
              ? "white"
              : this.props.backgroundColor
              ? this.props.backgroundColor
              : "",
        }}
        className={
          this.state.editing
            ? "vendors-table-cell active"
            : `content-preview ${
                this.props.textColor ? this.props.textColor : ""
              } ${
                this.props.readonly || this.props.invoiced === true
                  ? "readonly"
                  : ""
              }`
        }
        onClick={() => {
          if (
            !this.state.editing &&
            !this.props.readonly &&
            this.props.invoiced !== true &&
            this.props.rowData.id !== "total"
          ) {
            this.setState({ editing: true });
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          this.setState({ editing: false });
        }}
      >
        {!this.state.editing ? (
          this.props.type === "tags" ? (
            this.state.cellValue ? (
              this.state.cellValue.map((cv: any) => {
                if (cv) {
                  return (
                    <Tag colorScheme={this.props.textColor} mb="5px" mr={"5px"}>
                      {cv}
                    </Tag>
                  );
                }
              })
            ) : (
              ""
            )
          ) : this.props.type === "multiple-dropdown" ? (
            Array.isArray(this.state.cellValue) ? (
              this.state.cellValue.map((cv: any) => {
                return (
                  <Tag colorScheme={this.props.textColor} mb="5px" mr={"5px"}>
                    {cv}
                  </Tag>
                );
              })
            ) : (
              ""
            )
          ) : this.props.type === "date" ? (
            this.state.cellValue && this.state.cellValue !== null ? (
              moment(this.state.cellValue).format("DD.MM.yyyy")
            ) : (
              ""
            )
          ) : typeof this.state.cellValue === "object" ? (
            this.state.cellValue !== null ? (
              `${this.state.cellValue.label}`
            ) : (
              ""
            )
          ) : typeof this.state.cellValue === "number" ? (
            `${NumberWithCommas(this.state.cellValue)}`
          ) : (
            `${this.state.cellValue}`
          )
        ) : this.props.type === "text" || this.props.type === "number" ? (
          <textarea
            autoFocus
            style={{ resize: "none" }}
            value={this.state.cellValue ?? ""}
            onChange={(event) => {
              if (
                this.props.maxLength !== undefined &&
                event.target.value.length > this.props.maxLength
              ) {
                return;
              }
              this.setState({ cellValue: event.target.value });
            }}
            onFocus={(e) => {
              setTimeout(() => {
                document.execCommand("selectAll", false);
              }, 0);
            }}
            onKeyPress={
              this.props.type === "number"
                ? (event) => {
                    const keyCode = event.keyCode || event.which;
                    const string = String.fromCharCode(keyCode);
                    if (!numRegex.test(string)) {
                      event.defaultPrevented = false;
                      if (event.preventDefault) event.preventDefault();
                    }
                  }
                : undefined
            }
            onBlur={(event) => {
              this.props.onUpdate(
                this.props.rowData.id,
                this.props.columnKey,
                this.props.type === "number"
                  ? Number(this.state.cellValue)
                  : this.state.cellValue
              );
              this.setState({ editing: false });
            }}
            className="content-editable"
          />
        ) : this.props.type === "date" ? (
          <DatePicker
            autoFocus
            isClearable
            selected={
              isValidDate(this.state.cellValue)
                ? moment(this.state.cellValue).toDate()
                : null
            }
            customInput={<input className="datepicker-input"></input>}
            onChange={(date) => {
              this.setState({ cellValue: date, editing: false });
              this.props.onUpdate(
                this.props.rowData.id,
                this.props.columnKey,
                date !== null ? date.toString() : null
              );
            }}
            onCalendarClose={() => {
              this.setState({ editing: false });
            }}
            dateFormat="dd.MM.yyyy"
          />
        ) : this.props.type === "dropdown" ||
          this.props.type === "value-dropdown" ||
          this.props.type === "multiple-dropdown" ? (
          <Creatable
            menuPortalTarget={document.body}
            menuIsOpen={this.state.editing}
            autoFocus
            isMulti={this.props.type === "multiple-dropdown"}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 1000000 }),
              menu: (provided) => ({
                ...provided,
                zIndex: 1000000,
                minWidth: "200px",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "black",
              }),
              control: (base, state) => ({
                ...base,
                paddingLeft: "5px",
                boxShadow: "none",
                outlineWidth: 0,
                border: 0,
                minHeight: 52,
                backgroundColor: "transparent",
                transition: "0.3s",
              }),
            }}
            theme={(theme) => ({
              ...theme,
              borderRadius: 0,
              colors: {
                ...theme.colors,
                primary: "#a0bfe3",
              },
            })}
            value={this.state.cellValue}
            onChange={(value) => {
              this.setState({
                cellValue: value !== null ? value : { label: "", value: "" },
              });
              var v: any = "";
              if (value !== null && Array.isArray(value)) {
                v = [];
                value.map((dv: any) => v.push(dv.label));
              }
              if (value !== null && !Array.isArray(value)) {
                v = value.label;
                if (this.props.type === "value-dropdown") {
                  v = value.value;
                }
              }
              this.props.onUpdate(
                this.props.rowData.id,
                this.props.columnKey,
                v
              );
              this.setState({ editing: false });
            }}
            onFocus={async () => {
              this.setState({
                options: this.props.loadOptions(this.props.columnKey ?? ""),
              });
            }}
            onBlur={() => {
              this.setState({
                options: [],
                editing: false,
              });
            }}
            placeholder=""
            classNamePrefix="table-select"
            isClearable
            isSearchable
            options={this.state.options}
          />
        ) : this.props.type === "button" ? (
          <div className="table-button-container">
            <Button
              colorScheme={this.props.textColor}
              onClick={() => {
                this.props.onUpdate(
                  this.props.rowData.id,
                  this.props.columnKey,
                  this.state.cellValue
                );
                this.setState({ editing: false });
              }}
              size="sm"
              color="white"
              className="table-button"
            >
              {this.state.cellValue}
            </Button>
          </div>
        ) : (
          <div>unknown</div>
        )}
      </div>
    );
  }
}

export default EditableTableCell;
