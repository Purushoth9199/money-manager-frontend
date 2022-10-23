import AddEditTransaction from '../Components/addEditTransaction'
import React, { useEffect, useState } from 'react'
import DefaultLayout from '../Components/Defaultlayout'
import '../Resources/transaction.css'
import { DatePicker, message, Select, Table } from 'antd';
import Spinner from '../Components/spinner';
import axios from 'axios';
import moment from "moment";
import Analytics from '../Components/analytics';
import { UnorderedListOutlined, AreaChartOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
const { RangePicker } = DatePicker;

function Home() {
  const [showAddEditTransactionModal, setShowAddEditTransactionModal] =
    useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null)
  const [loading, setloading] = useState(false);
  const [transactionData, setTransactionsData] = useState([]);
  const [frequency, setFrequency] = useState('7');
  const [type, setType] = useState('all');
  const [selectedRange, setSelectedRange] = useState([]);
  const [viewType, setViewType] = useState("table");

  const getTransactions = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("MoneyManager-users"));


      setloading(true);
      const response = await axios.post(
        "/api/transactions/get-all-transactions",
        {
          userId: user._id, frequency,
          ...(frequency === 'custom' && { selectedRange }),
          type
        });

      setTransactionsData(response.data)
      setloading(false);

    }
    catch (error) {
      setloading(false);
      message.error('Something went wrong');
    }
  };

  const deleteTransactions = async (record) => {
    try {
      setloading(true);
      await axios.post(
        "/api/transactions/delete-transaction",
        {
          transactionId: record._id
        });
      message.success('Transaction deleted successfully');
      getTransactions();
      setloading(false);

    }
    catch (error) {
      setloading(false);
      message.error('Something went wrong');
    }
  };

  useEffect(() => {
    getTransactions();
  }, [frequency, selectedRange, type]);

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      render: (text) => <span>{moment(text).format('DD-MM-YYYY')}</span>

    },
    {
      title: "Amount",
      dataIndex: "amount"
    },
    {
      title: "Category",
      dataIndex: "category"
    },
    {
      title: "Type",
      dataIndex: "type"
    },
    {
      title: "Description",
      dataIndex: "description"
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => {
        return (
          <div>
            <EditOutlined onClick={() => {
              setSelectedItemForEdit(record)
              setShowAddEditTransactionModal(true)
            }} />

            <DeleteOutlined className='mx-3' onClick={() => deleteTransactions(record)} />

          </div>
        )
      }

    }

  ]

  return (
    <DefaultLayout>
      {loading && <Spinner />}

      <div className="filter d-flex justify-content-between align-items-center">
        <div className='d-flex'>
          <div className='d-flex flex-column'>

            <h6> Select Frequency  </h6>
            <Select value={frequency} onChange={(value) => setFrequency(value)}>
              <Select.Option value='7'> Last 1 Week</Select.Option>
              <Select.Option value='31'> Last 1 Month</Select.Option>
              <Select.Option value='180'> Last 6 Months</Select.Option>
              <Select.Option value='365'> Last 1 Year</Select.Option>
              <Select.Option value='custom'>Custom</Select.Option>
            </Select>

            {frequency === 'custom' && (
              <div className='mt-2'>
                <RangePicker value={selectedRange} onChange={(values) => setSelectedRange(values)} />

              </div>
            )}
          </div>
          <div className='d-flex flex-column mx-5'>

            <h6> Select Type </h6>
            <Select value={type} onChange={(value) => setType(value)}>
              <Select.Option value="income"> Income</Select.Option>
              <Select.Option value="expense"> Expense</Select.Option>
              <Select.Option value="all"> All </Select.Option>
            </Select>


          </div>
        </div>


        <div className='d-flex'>
          <div>
            <div className='view-switch mx-5'>

              <UnorderedListOutlined
                className={`mx-3 ${viewType === "table" ?
                  'active-icon' : "inactive-icon"}`}
                onClick={() => setViewType('table')}
                size={30} />

              <AreaChartOutlined
                className={`${viewType === "analytics" ?
                  'active-icon' : "inactive-icon"}`}
                onClick={() => setViewType('analytics')}
                size={30} />
            </div>
          </div>

          <button className="primary" onClick={() => setShowAddEditTransactionModal(true)}>ADD NEW </button>

        </div>
      </div>
      <div className="table-analtics">
        {viewType === 'table' ? <div className="table">
          <Table columns={columns} dataSource={transactionData} />
        </div> : <Analytics transactions={transactionData} />}

      </div>


      {showAddEditTransactionModal &&
        (<AddEditTransaction
          showAddEditTransactionModal={showAddEditTransactionModal}
          setShowAddEditTransactionModal={setShowAddEditTransactionModal}
          selectedItemForEdit={selectedItemForEdit}
          getTransactions={getTransactions}
          setSelectedItemForEdit={setSelectedItemForEdit}
        />
        )}
    </DefaultLayout>
  );
}


export default Home