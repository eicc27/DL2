package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type SourceCode struct {
	Url    string `json:"url"`
	Rating int    `json:"rating"`
}

type Method struct {
	Id      string `json:"id"`
	Method  string `json:"method"`
	Desc    string `json:"desc"`
	ArxivId string `json:"arxivId"`
}

type Task struct {
	Id   string `json:"id"`
	Name string `json:"name"`
	Desc string `json:"desc"`
}

type Paper struct {
	Codes            []SourceCode `json:"codes"`
	Methods          []string     `json:"methods"`
	Authors          []string     `json:"authors"`
	Name             string       `json:"name"`
	Id               string       `json:"id"`
	Abstract         string       `json:"abstract"`
	References       int          `json:"references"`
	Citations        int          `json:"citations"`
	ReferencedPapers []string     `json:"referencedPapers"`
	Tasks            []Task       `json:"tasks"`
}

type Response struct {
	Code    int      `json:"code"`
	Message string   `json:"message"`
	Papers  []Paper  `json:"papers"`
	Methods []Method `json:"methods"`
}

type PaperEmbedRequest struct {
	Title    string `json:"title"`
	Abstract string `json:"abstract"`
}

func Cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		method := c.Request.Method
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Header("Access-Control-Allow-Origin", "*")
			c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")
			c.Header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
			c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Cache-Control, Content-Language, Content-Type")
			c.Header("Access-Control-Allow-Credentials", "true")
		}
		if method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
		}
		c.Next()
	}
}

func Serve() {
	g := gin.Default()
	g.Use(Cors())
	g.POST("/papers", func(c *gin.Context) {
		b, _ := io.ReadAll(c.Request.Body)
		var p Response
		json.Unmarshal(b, &p)
		// save the json
		data, _ := json.MarshalIndent(p, "", "  ")
		os.WriteFile("data.json", data, 0644)
		fmt.Println("saved file")
		// send the json to the other services
		Test()
	})
	g.POST("/embed", func(ctx *gin.Context) {
		b, _ := io.ReadAll(ctx.Request.Body)
		var p PaperEmbedRequest
		json.Unmarshal(b, &p)
		bg := context.Background()
		client, _ := genai.NewClient(ctx, option.WithAPIKey("AIzaSyD0NpI_90atLTdjD7ODsEpPAWErX1UhPoc"))
		defer client.Close()
		model := client.EmbeddingModel("embedding-001")
		resp, err := model.EmbedContentWithTitle(bg, p.Title, genai.Text(p.Abstract))
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"embedding": resp.Embedding})
	})
	g.Run(":27001")
}

func Test() {
	r := SetRequest(Response{}, true)
	t, _ := json.Marshal(r)
	os.WriteFile("request.json", t, 0644)
	println("sql")
	PutPapers(r, "http://localhost:8080/paper/papers")
	println("n4j")
	resp := PutPapers(r, "http://localhost:8081/paper/papers")
	os.WriteFile("response.json", []byte(resp), 0644)
}
func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: exporter <mode>(test or serve)")
		return 
	}
	if os.Args[1] == "test" {
		Test()
	} else if os.Args[1] == "serve" {
		Serve()
	} else {
		fmt.Println("Usage: exporter <mode>(test or serve)")
		return
	}
}
