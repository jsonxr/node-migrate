#-------------------------------------------------------------
# Example of a rename column with deprecation support
#-------------------------------------------------------------

delimiter $$


CREATE TABLE `example` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `one` varchar(255) DEFAULT NULL,
  `two` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8$$

CREATE TABLE `example2` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `one` varchar(255) DEFAULT NULL,
  `two` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8$$


# Copy all existing data to new table
INSERT INTO example2 SELECT * FROM example$$


# GET the autoinc of the old table
SELECT AUTO_INCREMENT
FROM information_schema.tables
WHERE table_name = 'example'
AND table_schema = DATABASE()$$

# SET the autoinc of the new table
ALTER TABLE example2 AUTO_INCREMENT = 2$$


# AFTER INSERT triggers
DROP TRIGGER IF EXISTS example_ai$$
CREATE
TRIGGER example_ai
AFTER INSERT ON example
FOR EACH ROW
BEGIN
	IF NOT EXISTS(SELECT 1 FROM example2 WHERE id = new.id) THEN
		INSERT INTO example2 (id, one, two) values (new.id, new.one, new.two);
	END IF;
END
$$


DROP TRIGGER IF EXISTS example2_ai$$
CREATE
TRIGGER example2_ai
AFTER INSERT ON example2
FOR EACH ROW
BEGIN
	IF NOT EXISTS(SELECT 1 FROM example WHERE id = new.id) THEN
		INSERT INTO example (id, one, two) values (new.id, new.one, new.two);
	END IF;
END
$$

-- E2.UPDATE -> E1.UPDATE (IGNORE TRIGGER)


# AFTER UPDATE triggers (need a timestamp field???)
DROP TRIGGER IF EXISTS example_au$$
CREATE
TRIGGER example_au
AFTER UPDATE ON example
FOR EACH ROW
BEGIN
	IF @updating_example IS NULL THEN
		SET @updating_example = 1;
		UPDATE example2
		SET
			one = new.one,
			two = new.two
		WHERE
			id = new.id;
		SET @updating_example = NULL;
	END IF;
END
$$

DROP TRIGGER IF EXISTS example2_au$$
CREATE
TRIGGER example2_au
AFTER UPDATE ON example2
FOR EACH ROW
BEGIN
	IF @updating_example IS NULL THEN
		SET @updating_example = 1;
		UPDATE example
		SET
			one = new.one,
			two = new.two
		WHERE
			id = new.id;
		SET @updating_example = NULL;
	END IF;
END
$$





truncate table example$$
truncate table example2$$
insert into example (one) values ('value1')$$
insert into example2 (two) values ('value2')$$
select * from example$$
select * from example2$$

update example
	set one = '1'
where id = 1$$


update example2
	set two = '2'
where id = 2$$
select * from example$$



-- Error Code: 1442. Can't update table 'example' in stored function/trigger because it is already used by statement which invoked this stored function/trigger.



