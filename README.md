# datomic-qbuilder

## Overview

Datomic QBuilder is an attempt to create a different Datomic console than the one provided by Datomic.

[Here's a quick video preview](media/DatomicQBuilderPreview.mp4) of some features of the QBuilder.

## Features
### Datalog Source
In this view, one can compose/view a raw Datalog query with pull expression support.
The pull expression is enabled if the find is in the collection form, e.g. 
`[?e ...]`. If the find is in other form, the pull expression is disabled and ignored. 

### Datalog Builder
In this view, one can use the builder for building where and pull expressions.

#### Where Section
The first column in the where section represents the entity (E), the second column the 
attribute (A) and the third column represents the value (V). 

The builder where expressions are aware of entities and suggest the attributes belonging
to the given entity only. Similarly, the builder knows the value type and for instance, 
if a value is an enum, it will offer all the possible enums for the given attribute.

Each expression can be moved up/down, removed and, if the current entity is linked from 
another entity, a "Link" button will add a where expression that links to the current
entity.

#### Pull Section
The pull expressions that also support nested attributes in case of reference attribute

### Nested Results Display
The results are able to display nested data (e.g. the data obtained from Datomic by the use
of the '*' pull expression)

### Intelligent Sorting of Results
Not yet implemented

### Schema Viewer
Not yet implemented


## Prerequisites

1. Datomic

You need a Datomic database, the installation of Datomic is beyond this file's scope...

Follow the instructions on [mbrainz database](https://github.com/Datomic/mbrainz-sample)
to import a sample MBrainz Database into Datomic by issuing the following command:

`./bin/datomic 'restore-db file://PATH_TO_mbrainz-1968-1973 datomic:sql://qbuilder?jdbc:postgresql://localhost:5432/datomic?user=YOUR_USERNAME&password=YOUR_PASSWORD'`

The provided schema:
(`./resources/migrations/schema.edn`)
is for the MBrainz Database.

2. Clojure

`brew install clojure`

2. [Leiningen][1] 2.0 or above

`brew install leiningen`

[1]: https://github.com/technomancy/leiningen

3. Node (for the web client)

`brew install node`

## Server configuration

Create the following configuration file:

`dev-config.edn`

And paste the following configuration:

```
{:dev true
 :port 8080
 ;; when :nrepl-port is set the application starts the nREPL server on load
 :nrepl-port 7000

 ; set your dev database connection URL here
 :database-url "datomic:sql://qbuilder?jdbc:postgresql://localhost:5432/datomic?user=YOUR_USERNAME&password=YOUR_PASSWORD"

 ; alternatively, you can use the datomic mem db for development:
 ; :database-url "datomic:mem://datomic_qbuilder_datomic_dev"
}
```

## Running

### Backend Web Server

To start the web server for the application, run:

`lein run`

The server will serve on port 8080.

### Front-end Web Application / Web Client

To set up and start the web client, please see the web client README:

`./client-gui/README.md`

