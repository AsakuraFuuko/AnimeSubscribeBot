# AnimeSubscribeBot
a bot for telegram

###### user table
```sql
create table users(user_id integer not null unique, status boolean, token text);
```

###### anime table
```sql
create table animes(id serial, user_id integer, title text, keywords text, episode integer);
```

###### episode table
```sql
create table episodes(id serial, user_id integer, name text, title text , torrent text, magnet text);
```