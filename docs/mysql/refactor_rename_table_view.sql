#-----------------------------------------------------------------
# Example of a rename table with deprecation support using a view
#
# Limitations
#
# The view must contain all columns in the base table that do not have a default value.
# So, if a new column is added with a default, the old view becomes invalid.
# In order to add new fields with defaults, all applications must no longer be
# using the old table.
#
# What happens to foreign keys?
# What happens to indexes?
#
#-----------------------------------------------------------------

delimiter $$

DROP TABLE IF EXISTS example_old$$
DROP TABLE IF EXISTS example_new$$
DROP VIEW IF EXISTS example_old$$


CREATE TABLE example_old (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `one` varchar(255) DEFAULT NULL,
  `two` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8$$

# Rename the table
RENAME TABLE example_old TO example_new$$

# Create a view 
CREATE VIEW example_old as SELECT * FROM example_new$$



truncate table example_old$$
truncate table example_new$$
insert into example_old (one) values ('value1')$$
insert into example_new (two) values ('value2')$$
select * from example_old$$
select * from example_new$$

update example_old
	set one = '1'
where id = 1$$

update example_new
	set two = '2'
where id = 2$$

delete from example_old WHERE id = 1$$
delete from example_new WHERE id = 2$$


-- Error Code: 1442. Can't update table 'example' in stored function/trigger because it is already used by statement which invoked this stored function/trigger.



