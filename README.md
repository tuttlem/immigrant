# Immigrant

A database migration tool.

## Introduction

Immigrant aims to provide a simple upgrade/downgrade path to your database projects. Keeping projects in a directory format that can be easily version controlled by git.

## Actions

### init

`immigrant init <folder>`

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

`immigrant create <name>`

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

`immigrant migrate <env> <ver>`

The `migrate` message takes in a defined environment as well as a version to migrate to. It will attempt to roll the target database forward to the requested version by executing all of the scripts from `current+1` up to `requested`. In cases where the latest version is requested, the `*` symbol is used for version.

When the same version is requested that is deployed, the `migrate` message will attempt to re-apply the requested version.

### rollback

`immigrant rollback <env> <ver>`

The `rollback` message takes in a defined environment as well as a version to rollback to. It will attempt to roll the target database backwards to the requested version by executing all of the scripts from `current` down to `requested` in reverse order. In cases where the latest version is requested, the `*` symbol is used for version.

### query

`immigrant query <env>`

The `query` message will query the target environment database for the latest deployed version of the migration project, and display it to screen.

## Environments

After you have created your project, you're offered three environments out of the box. You can add and remove from these as you need to, to suit your project. Each environment is listed as a top level dictionary attribute in the `config.json` file listed in the root directory. By default, you're given configurations for three sqlite datwbases.

```
{
  "dev": "sqlite://./dev.sqlite",
  "test": "sqlite://./test.sqlite",
  "production": "sqlite://./production.sqlite"
}
```

These should be chanbed to your target database systems.

