from pyspark.sql import SparkSession
from pyspark.sql.functions import col
from pyspark.sql.functions import sum
import sys

host = "database-test.cb6gwcrbia4j.us-east-1.rds.amazonaws.com"
database = "dl2"
table = "user_paper"
user = "admin"
password = "Jise246808642"

# create a Spark session for the current running app
spark = SparkSession.builder.appName('Collaborative Filtering').getOrCreate()

# read the input file through a Spark Context
data = spark.read.format("jdbc").option("url", f"jdbc:mysql://{host}/{database}").option("dbtable", table).option(
    "user", user).option("password", password).option("driver", "com.mysql.jdbc.Driver").load()
data.cache()
data.show()

pair_data = (
    data.alias("i").join(data.alias("j"), on="userid").filter(col("i.paperid") < col("j.paperid")).select(
        col("i.paperid").alias("paper1"), col("j.paperid").alias("item2"),
        (col("i.rating") * col("j.rating")).alias("rating"))
)
pair_data.show()

pair_data = pair_data.groupBy("paper1", "paper2").agg(sum("rating").alias("rating_sum"))
item_similarity = pair_data.withColumn("similarity", col("rating_sum")/(col("item1_count")*col("item2_count")))


item_similarity.write.mode("overwrite").csv(sys.argv[1])