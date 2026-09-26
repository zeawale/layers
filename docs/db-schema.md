# Схема базы

Ответственная: Настя. Дедлайн первой версии — 28 сентября.

Правила:
- Названия таблиц — множественное число в нижнем регистре: `users`, `items`.
- Названия полей — `snake_case`.
- Первичный ключ — `id`.
- Внешний ключ — `<таблица_в_единственном_числе>_id`: `user_id`, `item_id`.
- У каждой пользовательской сущности есть `user_id` — без него нельзя отличить свои вещи от чужих.
- Даты создания и изменения: `created_at`, `updated_at`.
- Названия атрибутов одежды берём из `docs/attributes.md`, не придумываем заново.

## Таблицы

### users

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | serial | PK | |
| email | text | unique, not null | |
| password_hash | text | not null | Пароль в открытом виде не хранится никогда |
| created_at | timestamptz | not null, default now() | |

### items

Вещи гардероба. Поля берём из справочника атрибутов.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | serial | PK | |
| user_id | int | FK → users.id, not null | |
| category | text | not null | значение из attributes.md: category |
| color | text | not null | значение из attributes.md: color |
| warmth | int | not null, 1–5 | значение из attributes.md: warmth |
| style | text | not null | значение из attributes.md: style |
| water_resistance | boolean | not null, default false | значение из attributes.md: water_resistance |
| photo_path | text | | путь к файлу на диске, не сам файл |
| created_at | timestamptz | not null, default now() | |
| updated_at | timestamptz | not null, default now() | |

### item_seasons

У одной вещи может быть несколько сезонов сразу (например, куртка на демисезон и зиму), поэтому это отдельная таблица, а не поле.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| item_id | int | FK → items.id, not null | |
| season | text | not null | значение из attributes.md: season |

Первичный ключ — пара (`item_id`, `season`).

### outfits

Комплекты.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | serial | PK | |
| user_id | int | FK → users.id, not null | |
| date | date | not null | день, на который собран комплект |
| explanation | text | | текстовое объяснение выбора движка |
| created_at | timestamptz | not null, default now() | |

### outfit_items

Связь комплекта с вещами, которые в него входят.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| outfit_id | int | FK → outfits.id, not null | |
| item_id | int | FK → items.id, not null | |

Первичный ключ — пара (`outfit_id`, `item_id`).

### outfit_feedback

Оценки.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | serial | PK | |
| outfit_id | int | FK → outfits.id, not null | |
| rating | text | not null | `like` или `dislike` |
| created_at | timestamptz | not null, default now() | |

### wear_history

История носки.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | serial | PK | |
| item_id | int | FK → items.id, not null | |
| worn_date | date | not null | |

### weather_records

Погодные записи — кеш прогноза, чтобы не дёргать Open-Meteo на каждый запрос.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | serial | PK | |
| user_id | int | FK → users.id, not null | |
| date | date | not null | |
| temperature | numeric | not null | |
| feels_like | numeric | | «ощущается как» |
| precipitation | numeric | | осадки |
| wind_speed | numeric | | |
| fetched_at | timestamptz | not null, default now() | момент запроса к Open-Meteo |

### partner_products

Партнёрские товары.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | serial | PK | |
| category | text | not null | значение из attributes.md: category |
| color | text | | значение из attributes.md: color |
| style | text | | значение из attributes.md: style |
| min_warmth | int | | |
| price | numeric | | |
| url | text | not null | |
| title | text | | |

## Связи

Словами: что с чем связано и один-ко-многим или многие-ко-многим.

- `users` → `items`: один пользователь — много вещей (один-ко-многим).
- `users` → `outfits`: один пользователь — много комплектов (один-ко-многим).
- `outfits` ↔ `items` через `outfit_items`: многие-ко-многим — в одном комплекте несколько вещей, одна вещь входит в разные комплекты в разные дни.
- `outfits` → `outfit_feedback`: один комплект — несколько оценок (один-ко-многим, пользователь может попросить «другой вариант» несколько раз).
- `items` → `item_seasons`: одна вещь — несколько сезонов (один-ко-многим).
- `items` → `wear_history`: одна вещь — много записей о том, когда её носили (один-ко-многим).
- `users` → `weather_records`: один пользователь — много погодных записей за разные дни (один-ко-многим).
- `partner_products` ни к чему не привязана напрямую — подбирается на лету по совпадению `category`, `color`, `style`, `min_warmth`.
