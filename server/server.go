package main

import (
	"log"
	"net/http"
	"os"
	"path"
	"strings"
)

var port = ":8080"

var pagesPath = "./static/"
var page404 = "/missing.html"

type FSHandler404 = func(w http.ResponseWriter, r *http.Request) (doDefaultFileServe bool)

func fileSystem404(w http.ResponseWriter, r *http.Request) (doDefaultFileServe bool) {
	//if not found redirect to /missing.html
	http.Redirect(w, r, page404, http.StatusFound)
	return true
}

func FileServerWith404(root http.FileSystem, handler404 FSHandler404) http.Handler {
	fs := http.FileServer(root)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		upath := r.URL.Path
		if !strings.HasPrefix(upath, "/") {
			upath = "/" + upath
			r.URL.Path = upath
		}
		upath = path.Clean(upath)

		f, err := root.Open(upath)
		if err != nil {
			if os.IsNotExist(err) {
				if handler404 != nil {
					if doDefault := handler404(w, r); !doDefault {
						return
					}
				}
			}
		}

		if err == nil {
			f.Close()
		}

		fs.ServeHTTP(w, r)
	})
}

func main() {
	fs := FileServerWith404(http.Dir(pagesPath), fileSystem404)
	http.Handle("/", fs)

	// http.Handle("/", http.FileServer(http.Dir(pagesPath)))

	// http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))

	log.Printf("listening on %s", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
