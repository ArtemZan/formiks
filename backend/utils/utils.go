package utils

import (
	"math"
	"strconv"
)

func String2float(s string, r ...bool) float64 {
	f, err := strconv.ParseFloat(s, 64)
	if err != nil {
		f = 0.0
	}
	if len(r) > 0 && !r[0] {
		return f
	}
	output := math.Pow(10, float64(2))
	return float64(round(f*output)) / output

}

func round(num float64) int {
	return int(num + math.Copysign(0.5, num))
}
