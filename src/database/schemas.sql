create database javascript_music_player;

create table users(
    id serial primary key,
    username varchar(55) not null,
    email text not null,
    password text not null
);
