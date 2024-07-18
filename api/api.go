package main

import (
	"database/sql"
	"errors"
	"log"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/mattn/go-sqlite3"
)

type User struct {
	Nmae  string `json:"name"`
	Email string `json:"email"`
}

type SubmittedForm struct {
	ID           int
	Name         string `json:"name"`
	Company      string `json:"company"`
	Email        string `json:"email"`
	Phone        string `json:"phone"`
	Comment      string `json:"comment"`
	IsAgree      string `json:"isAgree"`
	CreationDate string `json:"creationDate"`
}

var (
	ErrDuplicate    = errors.New("record already exists")
	ErrNotExists    = errors.New("row not exists")
	ErrUpdateFailed = errors.New("update failed")
	ErrDeleteFailed = errors.New("delete failed")
)

type SQLiteRepository struct {
	// sql.DB is an object representing a pool of DB connections
	// for all dribvers compatible with the database/sql interface
	db *sql.DB
}

func NewSQLiteRepository(db *sql.DB) *SQLiteRepository {
	return &SQLiteRepository{
		db: db,
	}
}

// Creates an SQL table and initializes all the data necessary to operate on the repository
func (r *SQLiteRepository) Migrate() error {
	query := `
	CREATE TABLE IF NOT EXISTS submittedForms(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		company TEXT NOT NULL,
		email TEXT,
		phone TEXT,
		comment TEXT,
		isAgree TEXT NOT NULL,
		creationDate TEXT NOT NULL
	);
	`

	_, err := r.db.Exec(query)
	return err
}

// Writes record to the database
func (r *SQLiteRepository) Create(form SubmittedForm) (*SubmittedForm, error) {
	res, err := r.db.Exec("INSERT INTO submittedForms(name, company, email, phone, comment, isAgree, creationDate) values(?, ?, ?, ?, ?, ?, ?)",
		form.Name, form.Company, form.Email, form.Phone, form.Comment, form.IsAgree, form.CreationDate)
	if err != nil {
		var sqliteErr sqlite3.Error
		// check if error is an instance of sqlite3.error
		if errors.As(err, &sqliteErr) {
			// check if error code indicates an SQLite unique constraint violation
			if errors.Is(sqliteErr.ExtendedCode, sqlite3.ErrConstraintUnique) {
				return nil, ErrDuplicate
			}
		}
		return nil, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return nil, err
	}

	form.ID = int(id)
	return &form, nil
}

func (r *SQLiteRepository) All() ([]SubmittedForm, error) {
	rows, err := r.db.Query("SELECT * FROM submittedForms")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var all []SubmittedForm
	// Next returns true if there are more rows in the result
	for rows.Next() {
		var form SubmittedForm
		// Scan copies successive values of the result set into the given variables
		if err := rows.Scan(&form.ID, &form.Name,
			&form.Company, &form.Email, &form.Phone,
			&form.Comment, &form.IsAgree, &form.CreationDate); err != nil {
			return nil, err
		}
		all = append(all, form)
	}

	return all, nil
}

func (r *SQLiteRepository) GetByName(name string) (*SubmittedForm, error) {
	row := r.db.QueryRow("SELECT * FROM submittedForms WHERE name = ?", name)

	var form SubmittedForm
	if err := row.Scan(&form.ID, &form.Name,
		&form.Company, &form.Email, &form.Phone,
		&form.Comment, &form.IsAgree, &form.CreationDate); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotExists
		}
		return nil, err
	}
	return &form, nil
}

func (r *SQLiteRepository) Update(id int, updated SubmittedForm) (*SubmittedForm, error) {
	if id == 0 {
		return nil, errors.New("invalid updated ID")
	}
	res, err := r.db.Exec(`UPDATE submittedForms SET 
		name = ?, company = ?, email = ?, phone = ?, 
		comment = ?, isAgree = ?, creationDate = ? WHERE id = ?`,
		updated.Name, updated.Company, updated.Email, updated.Phone,
		updated.Comment, updated.IsAgree, updated.CreationDate, id)
	if err != nil {
		return nil, err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return nil, err
	}

	if rowsAffected == 0 {
		return nil, ErrUpdateFailed
	}

	return &updated, nil
}

func (r *SQLiteRepository) Delete(id int) error {
	res, err := r.db.Exec("DELETE FROM submittedForms WHERE id = ?", id)
	if err != nil {
		return err
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return ErrDeleteFailed
	}

	return err
}

func main() {
	var new bool
	if _, err := os.Stat("./db/analytics.db"); errors.Is(err, os.ErrNotExist) {
		new = true
	}

	db, err := sql.Open("sqlite3", "../db/analytics.db")
	if err != nil {
		log.Fatal(err)
	}
	// implement graceful shutdown
	defer db.Close()

	repo := NewSQLiteRepository(db)

	if new {
		if err := repo.Migrate(); err != nil {
			log.Fatalf("migrate: %s", err)
		}
	}

	e := echo.New()
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "hello, world!")
	})

	e.POST("/submit", func(c echo.Context) error {
		var form *SubmittedForm = &SubmittedForm{}
		if err := c.Bind(form); err != nil {
			log.Printf("submit, binding error: %s", err)
			return err
		}

		log.Printf("id: %d | name: %s | company: %s | email: %s | phone: %s ",
			form.ID, form.Name, form.Company, form.Email, form.Phone)

		_, err := repo.Create(*form)
		if err != nil {
			log.Printf("submit, create error: %s", err)
			return err
		}

		return c.JSON(http.StatusCreated, form)
	})

	e.GET("/show", func(c echo.Context) error {
		forms, err := repo.All()
		if err != nil {
			log.Printf("show, all error: %s", err)
			return err
		}
		for _, form := range forms {
			log.Printf("id: %d | name: %s | company: %s | email: %s | phone: %s ",
				form.ID, form.Name, form.Company, form.Email, form.Phone)
		}
		return c.NoContent(http.StatusOK)
	})

	e.Logger.Fatal(e.Start(":3000"))
}
