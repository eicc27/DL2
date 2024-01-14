package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"

	"github.com/eicc27/Gophunc/array"
	"github.com/eicc27/Gophunc/result"
)

type PaperRequest struct {
	Codes            []SourceCode `json:"codes"`
	Methods          []string     `json:"methods"`
	Authors          []string     `json:"authors"`
	Name             string       `json:"name"`
	Id               string       `json:"id"`
	Abstract         string       `json:"abs"`
	References       int          `json:"references"`
	Citations        int          `json:"citations"`
	ReferencedPapers []string     `json:"referencedPapers"`
	Tasks            []string     `json:"tasks"`
}

type Request struct {
	Papers  []PaperRequest `json:"papers"`
	Methods []Method       `json:"methods"`
	Tasks   []Task         `json:"tasks"`
}

func SetRequest(r Response, test bool) Request {
	if test {
		result.NewResult(os.ReadFile("data.json")).
			IfOKThen(func(t []byte) {
				json.Unmarshal(t, &r)
			}).
			IfErrorThen(func(err error) {
				panic(err)
			})
	}
	req := Request{
		Papers:  make([]PaperRequest, 0),
		Methods: r.Methods,
		Tasks:   make([]Task, 0),
	}
	taskSet := make(map[string]Task)
	for _, t := range r.Papers {
		pr := PaperRequest{
			Codes:            t.Codes,
			Methods:          t.Methods,
			Authors:          t.Authors,
			Name:             t.Name,
			Id:               t.Id,
			Abstract:         t.Abstract,
			References:       t.References,
			Citations:        t.Citations,
			ReferencedPapers: t.ReferencedPapers,
			Tasks:            array.NewMapper[string](t.Tasks...).SimpleMap(func(t Task) string { return t.Id }).ToArray(),
		}
		array.New(t.Tasks...).SimpleForEach(func(task Task) {
			taskSet[task.Id] = task
		})
		req.Papers = append(req.Papers, pr)
	}
	for _, task := range taskSet {
		req.Tasks = append(req.Tasks, task)
	}
	return req
}

func PutPapers(r Request, url string) string {
	data, _ := json.Marshal(r)
	req, _ := http.NewRequest("PUT", url, bytes.NewBuffer(data))
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	return string(body)
}
