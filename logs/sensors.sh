while true;
do
	datetime=$(date)
	data=$(curl -s http://localhost:5000/sensors)
	output=$(echo ${datetime} ${data})
	echo ${output}
	sleep 1
done;
