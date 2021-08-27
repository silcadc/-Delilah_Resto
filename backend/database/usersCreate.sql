 CREATE TABLE `delilah_resto`.`users` (
     `idusers` INT NOT NULL AUTO_INCREMENT,
     `username` VARCHAR(45) NULL,
     `fullname` VARCHAR(45) NULL,
     `email` VARCHAR(45) NULL,
     `telephone` INT NULL,
     `address` VARCHAR(45) NULL,
     `password` VARCHAR(45) NULL,
     `is_admin` BIT(1) NULL,
     PRIMARY KEY (`idusers`)
);

CREATE TABLE `delilah_resto`.`products` (
  `idproducts` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `price` decimal(2,0) DEFAULT NULL,
  `picture` varchar(45) DEFAULT NULL,
  `is_available` bit(1) DEFAULT NULL,
  PRIMARY KEY (`idproducts`)
)

CREATE TABLE `delilah_resto`.`orders` (
  `idorders` INT NOT NULL AUTO_INCREMENT,
  `idusers` INT NULL,
  `total` DECIMAL(10,2) NULL,
  `payment` VARCHAR(45) NULL,
  `address` VARCHAR(45) NULL,
  `date` DATETIME NULL,
  `status` VARCHAR(45) NULL,
  PRIMARY KEY (`idorders`),
  INDEX `idusers_idx` (`idusers` ASC) VISIBLE,
  CONSTRAINT `idusers`
    FOREIGN KEY (`idusers`)
    REFERENCES `delilah_resto`.`users` (`idusers`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


CREATE TABLE `delilah_resto`.`orders_products` (
  `idorders_products` INT NOT NULL AUTO_INCREMENT,
  `idorders` INT NULL,
  `idproducts` INT NULL,
  PRIMARY KEY (`idorders_products`),
  INDEX `idorders_idx` (`idorders` ASC) VISIBLE,
  INDEX `idproducts_idx` (`idproducts` ASC) VISIBLE,
  CONSTRAINT `idorders`
    FOREIGN KEY (`idorders`)
    REFERENCES `delilah_resto`.`orders` (`idorders`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `idproducts`
    FOREIGN KEY (`idproducts`)
    REFERENCES `delilah_resto`.`products` (`idproducts`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);