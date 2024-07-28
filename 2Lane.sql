DROP DATABASE twolane;
CREATE DATABASE twolane;
\connect twolane

\i 2Laneschema.sql

DROP DATABASE twolanetest;
CREATE DATABASE twolanetest;
\connect twolanetest

\i 2Laneschema.sql