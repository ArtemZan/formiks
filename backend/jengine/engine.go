package jengine

import (
	"fmt"

	"github.com/google/uuid"
	v8 "rogchap.com/v8go"
)

func CreateIsolate() (*v8.Isolate, error) {
	return v8.NewIsolate()
}

func CreateContext(iso *v8.Isolate) (*v8.Context, error) {
	isolate := iso
	if iso == nil {
		var err error
		isolate, err = v8.NewIsolate()
		if err != nil {
			return nil, err
		}
	}
	return v8.NewContext(isolate)
}

func RunScript(ctx *v8.Context, code string, filename string) (*v8.Value, error) {
	c := ctx
	if c == nil {
		var err error
		c, err = v8.NewContext()
		if err != nil {
			return nil, err
		}
	}
	return c.RunScript(code, filename)
}

func SetVariables(ctx *v8.Context, variables []Variable, ignoreErrors bool) error {
	obj := ctx.Global()
	for _, variable := range variables {
		err := obj.Set(variable.Name, variable.Value)
		if err != nil && !ignoreErrors {
			return err
		}
	}
	return nil
}

func ParseError(err error) (string, string) {
	e := err.(*v8.JSError)
	return e.Message, e.Location
}

func RandomFilename() string {
	return fmt.Sprintf("%s.js", uuid.New())
}
