# Схема базы

Ответственная: Настя. Дедлайн первой версии — 28 сентября.

Правила:
- Названия таблиц — множественное число в нижнем регистре: `users`, `items`.
- Названия полей — `snake_case`.
- Первичный ключ — `id`. Исключение — таблицы-связки, у них составной ключ из двух внешних.
- Внешний ключ — `<таблица_в_единственном_числе>_id`: `user_id`, `item_id`.
- У каждой пользовательской сущности есть `user_id` — без него нельзя отличить свои вещи от чужих. У таблиц-связок его нет: владелец определяется через родителя.
- Даты создания и изменения: `created_at`, `updated_at`.
- Названия атрибутов одежды берём из `docs/attributes.md`, не придумываем заново. Допустимые значения проверяет бэк (Pydantic), в базе они хранятся как `text`.
- Форматы объектов в ответах API — в `docs/API.md`. Если поле есть в объекте API, оно либо хранится здесь, либо ниже написано, как оно вычисляется.

## Таблицы

### users

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | serial | PK | |
| email | text | unique, not null | |
| password_hash | text | not null | Пароль в открытом виде не хранится никогда |
| city | text | | название города; `null`, пока пользователь не указал |
| lat | numeric | | координаты из геокодера Open-Meteo, заполняет бэк |
| lon | numeric | | |
| style | text | | значение из attributes.md: style; `null` — не выбран |
| liked_colors | text[] | not null, default '{}' | значения из attributes.md: color |
| disliked_colors | text[] | not null, default '{}' | значения из attributes.md: color |
| created_at | timestamptz | not null, default now() | |
| updated_at | timestamptz | not null, default now() | |

`onboarding_completed` из объекта User не хранится — вычисляется: `city` и `style` не `null`. Объект `preferences` в API — это `style`, `liked_colors`, `disliked_colors`.

### photos

Фото живёт отдельно от вещи: сначала загружается файл (`POST /photos`), потом создаётся вещь со ссылкой на него. Так одно фото используется и для распознавания, и для вещи.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | serial | PK | |
| user_id | int | FK → users.id, not null | кто загрузил; чужое фото к вещи привязать нельзя |
| path | text | not null | путь к файлу на диске, не сам файл |
| created_at | timestamptz | not null, default now() | |

Фото без вещи старше суток бэк удаляет вместе с файлом (`created_at` для этого и нужен).

### items

Вещи гардероба. Поля берём из справочника атрибутов.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | serial | PK | |
| user_id | int | FK → users.id, not null | |
| name | text | not null | название для интерфейса и текста объяснения, до 100 символов |
| category | text | not null | значение из attributes.md: category |
| color | text | not null | значение из attributes.md: color |
| warmth | int | not null, 1–5 | значение из attributes.md: warmth |
| style | text | | значение из attributes.md: style; `null` — подходит под любой стиль |
| water_resistance | boolean | not null, default false | значение из attributes.md: water_resistance |
| photo_id | int | FK → photos.id, on delete set null | `null` — вещь без фото |
| created_at | timestamptz | not null, default now() | |
| updated_at | timestamptz | not null, default now() | |

Сезоны — в `item_seasons`, потому что их может быть несколько.

### item_seasons

У одной вещи может быть несколько сезонов сразу (например, куртка на демисезон и зиму), поэтому это отдельная таблица, а не поле. Ни одной записи у вещи — всесезонная.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| item_id | int | FK → items.id, on delete cascade, not null | |
| season | text | not null | значение из attributes.md: season |

Первичный ключ — пара (`item_id`, `season`).

### weather_records

Погода на день — кеш прогноза, чтобы не дёргать Open-Meteo на каждый запрос, и одновременно снимок погоды, на которой собран комплект. Поля один в один с объектом Weather из API.md.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | serial | PK | |
| user_id | int | FK → users.id, not null | погода берётся по городу из профиля |
| date | date | not null | |
| city | text | not null | город на момент запроса |
| temp_min | numeric | not null | °C |
| temp_max | numeric | not null | °C |
| feels_like | numeric | not null | минимальная «ощущается как» за светлое время |
| wind_speed | numeric | not null | м/с |
| precipitation | numeric | not null | мм за день |
| condition | text | not null | `clear`, `cloudy`, `rain`, `snow` — сводится из кодов Open-Meteo на бэке |
| fetched_at | timestamptz | not null, default now() | момент запроса к Open-Meteo |

Уникальность — пара (`user_id`, `date`): на день одна запись, при обновлении кеша (раз в час) она перезаписывается, а не добавляется новая.

### outfits

Комплекты. На день у пользователя может быть несколько: каждый «другой вариант» — новый комплект, старый помечается отклонённым. Текущий комплект дня — последний по `created_at`.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | serial | PK | |
| user_id | int | FK → users.id, not null | |
| date | date | not null | день, на который собран комплект |
| weather_record_id | int | FK → weather_records.id, not null | погода, на которой собран |
| explanation | text | not null | текстовое объяснение выбора движка |
| missing | text[] | not null, default '{}' | категории, которых не хватило в гардеробе |
| rejected | boolean | not null, default false | `true` после «другой вариант» |
| rating | text | | `like` / `dislike`; `null` — не оценён |
| worn | boolean | not null, default false | надел ли комплект |
| feedback_at | timestamptz | | когда оценили; `null` — не оценён, тогда в API `feedback: null` |
| created_at | timestamptz | not null, default now() | |

Оценка хранится прямо в комплекте, потому что она одна на комплект (повторный запрос перезаписывает) — отдельная таблица тут не нужна. `missing` хранится, а не пересчитывается: комплект на день считается один раз и потом отдаётся тот же самый.

### outfit_items

Связь комплекта с вещами, которые в него входят.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| outfit_id | int | FK → outfits.id, on delete cascade, not null | |
| item_id | int | FK → items.id, not null | |

Первичный ключ — пара (`outfit_id`, `item_id`). Что делать с комплектами при удалении вещи — решаем на этапе 4 (см. API.md, `DELETE /items/{id}`).

### История носки

Отдельной таблицы нет — она выводится: вещь носили в день `outfits.date`, если она есть в `outfit_items` комплекта с `worn = true`. Движку для правила «вчера надевали — сегодня не предлагаем» этого достаточно, а две таблицы с одной и той же правдой разъехались бы.

### partner_products

Партнёрские товары. Этап 5 (к 7 декабря), формат черновой — согласуем вместе с разделом «Партнёрские товары» в API.md. Каталог заполняется вручную.

| Поле | Тип | Ограничения | Описание |
|---|---|---|---|
| id | serial | PK | |
| name | text | not null | |
| shop | text | not null | название магазина |
| price | numeric | | |
| url | text | not null | |
| image_url | text | | |
| category | text | not null | значение из attributes.md: category |
| color | text | | значение из attributes.md: color; `null` — любой |
| style | text | | значение из attributes.md: style; `null` — любой |
| min_warmth | int | | |
| water_resistance | boolean | not null, default false | главный сценарий партнёрки — «нет дождевика, вот дождевик» |

## Связи

- `users` → `items`, `photos`, `outfits`, `weather_records`: один пользователь — много (один-ко-многим).
- `items` → `photos`: у вещи не больше одного фото, фото может быть без вещи (пока не привязали или после отвязки).
- `items` → `item_seasons`: одна вещь — несколько сезонов (один-ко-многим).
- `outfits` → `weather_records`: много комплектов — одна погодная запись (все варианты одного дня собраны на одной погоде).
- `outfits` ↔ `items` через `outfit_items`: многие-ко-многим — в одном комплекте несколько вещей, одна вещь входит в разные комплекты в разные дни.
- `partner_products` ни к чему не привязана — подбирается на лету по совпадению `category`, `color`, `style`, `min_warmth`, `water_resistance` с тем, чего не хватило в `missing`.
