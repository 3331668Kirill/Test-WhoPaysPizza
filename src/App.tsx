import React, {useEffect, useState} from 'react';
import './App.css';


type TypeGuests = {
    party: Array<{ name: string, eatsPizza: boolean }>
}
type TypeVeganGuests = {
    diet: Array<{ name: string, isVegan: boolean }>
}
type TypeOrderPizza = {
    type: string
    name: string
    price: string
}
type TypeCurrency = {
    BYN: number
    USD: number
    EUR: number
}

const App = () => {

    const [eatsPizza, setEatsPizza] = useState<Array<string>>([])
    const [eatsVeganPizza, setVeganEatsPizza] = useState<Array<string>>([])
    const [priceForEvery, setPriceForEvery] = useState<string>('')
    const [paidPersons, setPaidPersons] = useState<number>(0)
    const [disabled, setDisabled] = useState<Array<number>>([])
    const [error, setError] = useState<string>('')

    useEffect(() => {
            fetch('https://gp-js-test.herokuapp.com/pizza/guests')
                .then((response) => response.json())
                .then((data: TypeGuests) => {

                    setEatsPizza(data.party.filter(t => t.eatsPizza).map(t => t.name))
                    return data.party.filter(t => t.eatsPizza).map(t => t.name)
                })
                .then(data => {
                    let str = data.join(',')
                    fetch(`https://gp-js-test.herokuapp.com/pizza/world-diets-book/${str}`)
                        .then(res => res.json())
                        .then((data: TypeVeganGuests) => {
                            setVeganEatsPizza(data.diet.filter(t => t.isVegan).map(t => t.name))
                        })
                })
                .catch(() => setError("Something go wrong, try again later"))

        },
        [])
    let priceForAll: Array<string> = []

    useEffect(() => {
        let orderPizza: string = ''

        if (eatsPizza.length > 0 && eatsVeganPizza.length > 0) {
            if (eatsPizza.length / 2 < eatsVeganPizza.length) {
                orderPizza = 'vegan'
            } else {
                orderPizza = 'meat'
            }

            const pr1 = fetch(`https://gp-js-test.herokuapp.com/pizza/order/${orderPizza}/${eatsPizza.length}`)
                .then(res => res.json())
                .then((data: TypeOrderPizza) => data.price)

            const pr2 = fetch('https://gp-js-test.herokuapp.com/pizza/currency')
                .then(res => res.json())
                .then((data: TypeCurrency) => data)
            Promise.all([pr1, pr2])
                .then((values: any) => {
                    priceForAll = values[0].split(' ')
                    setPriceForEvery(((((+priceForAll[0]) * (+values[1][priceForAll[1]]))) / eatsPizza.length).toFixed(1))
                })
                .catch(() => setError("Something go wrong, try again later"))
        }
    }, [eatsVeganPizza])
    const payPerson = (i: number) => {
        setPaidPersons(t => t + 1)
        setDisabled(st => {
            return [...st, i]
        })
    }
    let degree:number = 360 / eatsPizza.length
    let step:number = 0

    return (
        <div className="App">
            <header className="App-header">
                {eatsPizza.length === 0
                    ? <div style={{color: 'red', fontSize: '30px'}}>
                        LOADING....
                    </div>
                    : <div> {error
                        ? <div> {error}</div>
                        : <table>
                            <tbody className="table">
                            <tr className="table">
                                <th className="row_name">Name</th>
                                <th className="row_share">Share to pay</th>
                                <th className="row_pay">Pay</th>
                            </tr>
                            {eatsPizza && eatsPizza.map((t, i) => {
                                return (
                                    <tr key={t}>
                                        <td style={eatsVeganPizza.find(value => value === t) ? {color: 'green'} : {}}>{t}</td>
                                        <td>
                                            {priceForEvery} BYN
                                        </td>
                                        <td>
                                            <button disabled={i === disabled.find(value => value === i)}
                                                    onClick={() => payPerson(i)}>
                                                {i === disabled.find(value => value === i)
                                                    ? <span>PAID</span>
                                                    : <span>PAY</span>}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                            }
                            <tr className="total">
                                <td>Total order</td>
                                <td>{(+priceForEvery * eatsPizza.length).toFixed(1)} BYN</td>
                                <td> </td>
                            </tr>
                            <tr className="total">
                                <td>Money to collect</td>
                                <td>{(+priceForEvery * eatsPizza.length - (+priceForEvery * paidPersons)).toFixed(1)} BYN</td>
                                <td> </td>
                            </tr>
                            <tr className="total">
                                <td>Money collected</td>
                                <td>{(+priceForEvery * paidPersons).toFixed(1)} BYN</td>
                                <td> </td>
                            </tr>
                            </tbody>

                        </table>
                    }</div>
                }
                <div className="chart">
                    {eatsPizza && eatsPizza.map((t) => {
                        step = step + degree
                        return (
                            <div key={t}>
                                <div className="triangle"
                                     style={{transform: `rotate(${-step}deg)`, borderBottom: "solid black 2px"}}>
                                    <div className="circle" style={{borderLeft: "black solid 2px"}}> </div>
                                </div>
                            </div>
                        )
                    })
                    }
                </div>

            </header>
        </div>
    );
}

export default App;
