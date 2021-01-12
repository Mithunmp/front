import axios from 'axios';
import React, { useEffect , useState} from 'react';


const Trial = () =>{
    const [data, setData] = useState('')

    useEffect(()=>{
        axios.get('http://localhost:8000/api/demo')
            .then(response =>{
                console.log(response)
                setData(response.data.message)
            })
    })

    return (
    <h1> Hello  {data}</h1>
    )

}
export default Trial

// <?php

// use Illuminate\Database\Migrations\Migration;
// use Illuminate\Database\Schema\Blueprint;
// use Illuminate\Support\Facades\Schema;

// class CreateTaskTable extends Migration
// {
//     /**
//      * Run the migrations.
//      *
//      * @return void
//      */
//     public function up()
//     {
//         Schema::create('task', function (Blueprint $table) {
//             $table->id();
//             $table->string('title');
//             $table->text('description');
//             $table->bigInteger('user_id');
//             $table->foreign('user_id')->references('id')->on('users');
//             $table->bigInteger('assigner');
//             $table->date('due_date');
//             $table->enum('status',['assigned','inprogress','completed']);
//             $table->date('created_on');
//             $table->timestamps();
//         });
//     }

//     /**
//      * Reverse the migrations.
//      *
//      * @return void
//      */
//     public function down()
//     {
//         Schema::dropIfExists('task');
//     }
// }
