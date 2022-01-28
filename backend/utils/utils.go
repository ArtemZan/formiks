package utils

import "strconv"

func String2float(s string) float64 {
	f, err := strconv.ParseFloat(s, 64)
	if err != nil {
		f = 0.0
	}
	return f
}
