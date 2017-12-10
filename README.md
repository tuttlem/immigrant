# Immigrant

A database migration tool.

## Introduction

Immigrant aims to provide a simple upgrade/downgrade path to your database projects. Keeping projects in a directory format that can be easily version controlled by git.

## Actions

### init

The `init` message will create a new project for your database migrations. This action will setup the required directory structure that immigrant expects in further actions. It will expect the name of your project, that it will use to create the folder:

```
$ immigrant init proj1
$ tree proj1

proj1
├── config.json
├── down
└── up

2 directories, 1 file
```

The `up` and `down` directories hold migrate and rollback scripts respectively. `config.json` is used to control the configuration of your database, and where immigrant is expected to find them. These configurations are controlled by the environment names that you choose. The structure of each environment block will be a sequelize configuration block.

### create

The `create` message takes in the *name* of the migration and versions it. It'll create an `up` and `down` script for you, ready to edit.

```
$ immigrant create first
$ tree

.
├── config.json
├── down
│   └── 1512864101857-first.sql
└── up
    └── 1512864101857-first.sql

2 directories, 3 files
```

These files are now ready for editing, to place your migration code in.

### migrate

*Currently unimplemented*

### rollback

*Currently unimplmenented*

### query

*Currently unimplemented*

### baseline 

There is no *baseline* function inside of the *immigrant* application. Creating a baseline  (when you have an already existing database) is simply a matter of getting that database to generate a *CREATE* script for all of the tables that you want to bootstrap the database with, then applying any seed data (reference table data) that will be useful to a running database. 
The script that you create can be the *first* migration in your project, and called *baseline*. This is purely for preference though. *immigrant* won't care if the database already has tables or not; it's your personal choice to make your migration project portable or not.


