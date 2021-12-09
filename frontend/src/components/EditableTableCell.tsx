import {
  Box,
  Button,
  chakra,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tag,
  useColorModeValue,
} from "@chakra-ui/react";
import moment from "moment";
import React from "react";
import {
  AiFillInfoCircle,
  BsLightningFill,
  IoMdCheckmarkCircle,
  MdError,
} from "react-icons/all";
import DatePicker from "react-datepicker";
import Creatable from "react-select/creatable";

const numRegex = /[0-9]|\./;

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
      this.setState({ cellValue: this.props.initialValue });
    }
  }

  componentDidMount() {
    var value: any = undefined;
    switch (this.props.type) {
      case "text":
      case "number":
      case "button":
        value = this.props.initialValue
          ? this.props.initialValue.toString()
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
            ? { label: this.props.initialValue, value: this.props.initialValue }
            : { label: "", value: "" };
        break;
      case "multiple-dropdown":
        value = [];
        if (this.props.initialValue && Array.isArray(this.props.initialValue)) {
          this.props.initialValue.map((value: any) => {
            value.push({ label: value, value: value });
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
    this.setState({ cellValue: value });
  }

  render() {
    return (
      <div
        style={{
          textAlign: this.props.type === "button" ? "center" : "inherit",
          backgroundColor: this.props.backgroundColor
            ? this.props.backgroundColor
            : "",
        }}
        className={
          this.state.editing
            ? "vendors-table-cell active"
            : `content-preview ${
                this.props.textColor ? this.props.textColor : ""
              } ${this.props.readonly ? "readonly" : ""} ${
                this.props.rowData.parentId !== null ? "readonly" : ""
              }`
        }
        onClick={() => {
          if (
            !this.state.editing &&
            !this.props.readonly &&
            this.props.rowData.parentId === null
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
          ) : (
            `${this.state.cellValue}`
          )
        ) : this.props.type === "text" || this.props.type === "number" ? (
          <textarea
            autoFocus
            style={{ resize: "none" }}
            value={this.state.cellValue ?? ""}
            onChange={(event) => {
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
            // showTimeInput
            isClearable
            customInput={<input className="datepicker-input"></input>}
            // selected={this.state.cellValue}
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
          this.props.type === "multiple-dropdown" ? (
          <Creatable
            menuIsOpen={this.state.editing}
            autoFocus
            isMulti={this.props.type === "multiple-dropdown"}
            styles={{
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
            menuPortalTarget={document.body}
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
                  "data.companyName",
                  "Updated Name"
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
